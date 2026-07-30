import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/useAuth";
import type {
  CalibrationRoundItem,
  CriterionItem,
  Page,
  RoundItem,
  ScoreItem,
  SubmissionItem,
} from "../../api/types";
import { EmptyState } from "../../components/EmptyState";
import { toast } from "../../lib/toast";
import { ScoreSlider } from "../../components/ScoreSlider";

export function JudgePage() {
  const { user, refreshPermissions } = useAuth();
  const roundIds = (user?.roles ?? [])
    .filter((r) => r.roleName === "JUDGE" && r.scopeType === "ROUND" && r.scopeId)
    .map((r) => r.scopeId as string);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Chấm điểm</h1>
          <p className="page-subtitle">Danh sách vòng thi và bài nộp được phân công chấm điểm</p>
        </div>
        <button className="btn secondary small" onClick={refreshPermissions}>
          Làm mới phân công
        </button>
      </div>

      {roundIds.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Chưa có vòng thi nào được phân công"
            description={'Nếu vừa được phân công, hãy bấm "Làm mới phân công" ở trên.'}
          />
        </div>
      ) : (
        <>
          <CalibrationJudgeSection roundIds={roundIds} />
          {roundIds.map((roundId) => (
            <RoundScoringSection key={roundId} roundId={roundId} />
          ))}
        </>
      )}
    </div>
  );
}

function CalibrationJudgeSection({ roundIds }: { roundIds: string[] }) {
  const [rounds, setCalibrationRounds] = useState<(CalibrationRoundItem & { criteria: CriterionItem[] })[]>([]);

  useEffect(() => {
    (async () => {
      const roundInfos = await Promise.all(roundIds.map((id) => api.get<RoundItem>(`/api/rounds/${id}`)));
      const eventIds = Array.from(new Set(roundInfos.map((r) => r.data.eventId)));

      const allCalibRounds: CalibrationRoundItem[] = [];
      for (const eventId of eventIds) {
        const res = await api.get<CalibrationRoundItem[]>(`/api/events/${eventId}/calibration-rounds`);
        allCalibRounds.push(...res.data.filter((cr) => cr.active));
      }

      const withCriteria = await Promise.all(
        allCalibRounds.map(async (cr) => {
          const sample = await api.get<SubmissionItem>(`/api/submissions/${cr.sampleSubmissionId}`);
          const criteria = await api.get<CriterionItem[]>(`/api/rounds/${sample.data.roundId}/criteria`);
          return { ...cr, criteria: criteria.data };
        }),
      );
      setCalibrationRounds(withCriteria);
    })().catch((err) => toast.error((err as Error).message));
  }, [roundIds]);

  if (rounds.length === 0) return null;

  return (
    <div className="card" style={{ borderLeft: "4px solid var(--color-primary)" }}>
      <div className="card-title">Vòng hiệu chuẩn (Calibration): nghiên cứu RBL</div>
      <p className="muted" style={{ marginBottom: 14 }}>
        Chấm bài mẫu dưới đây trước khi chấm chính thức để đối chiếu mức độ đồng thuận với các giám khảo khác.
      </p>
      {rounds.map((cr) => (
        <CalibrationForm key={cr.id} calibrationRound={cr} criteria={cr.criteria} />
      ))}
    </div>
  );
}

function CalibrationForm({
  calibrationRound,
  criteria,
}: {
  calibrationRound: CalibrationRoundItem;
  criteria: CriterionItem[];
}) {
  const [values, setValues] = useState<Record<string, number>>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const items = criteria.map((c) => ({ criterionId: c.id, scoreValue: values[c.id] ?? 0 }));
    try {
      await api.put(`/api/calibration-rounds/${calibrationRound.id}/scores`, items);
      toast.success("Đã gửi điểm hiệu chuẩn.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <form onSubmit={submit} className="section-gap" style={{ background: "var(--color-bg)", padding: 14, borderRadius: 8 }}>
      <strong>{calibrationRound.name}</strong>
      <div className="grid grid-2 section-gap">
        {criteria.map((c) => (
          <ScoreSlider
            key={c.id}
            id={`calib-${calibrationRound.id}-${c.id}`}
            label={c.name}
            max={Number(c.maxScore)}
            value={values[c.id] ?? 0}
            onChange={(v) => setValues((prev) => ({ ...prev, [c.id]: v }))}
          />
        ))}
      </div>
      <button className="btn small" type="submit" style={{ alignSelf: "flex-start" }}>
        Gửi điểm hiệu chuẩn
      </button>
    </form>
  );
}

function RoundScoringSection({ roundId }: { roundId: string }) {
  const [round, setRound] = useState<RoundItem | null>(null);
  const [criteria, setCriteria] = useState<CriterionItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);

  async function load() {
    const [r, c, s] = await Promise.all([
      api.get<RoundItem>(`/api/rounds/${roundId}`),
      api.get<CriterionItem[]>(`/api/rounds/${roundId}/criteria`),
      api.get<Page<SubmissionItem>>(`/api/rounds/${roundId}/submissions`),
    ]);
    setRound(r.data);
    setCriteria(c.data);
    setSubmissions(s.data.content);
  }

  useEffect(() => {
    load().catch((err) => toast.error((err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId]);

  if (!round) return null;

  return (
    <div className="card">
      <div className="card-title">
        #{round.orderIndex} {round.name}
      </div>
      {submissions.length === 0 ? (
        <div className="muted">Chưa có bài nộp nào trong vòng này.</div>
      ) : (
        submissions.map((s) => <SubmissionScoreCard key={s.id} submission={s} criteria={criteria} />)
      )}
    </div>
  );
}

function SubmissionScoreCard({ submission, criteria }: { submission: SubmissionItem; criteria: CriterionItem[] }) {
  const [existingScores, setExistingScores] = useState<ScoreItem[]>([]);
  const [values, setValues] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [finalized, setFinalized] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    api.get<ScoreItem[]>(`/api/submissions/${submission.id}/scores`).then((res) => {
      setExistingScores(res.data);
      const v: Record<string, number> = {};
      const c: Record<string, string> = {};
      res.data.forEach((s) => {
        v[s.criterionId] = s.scoreValue;
        c[s.criterionId] = s.comment ?? "";
      });
      setValues(v);
      setComments(c);
    });
  }, [submission.id]);

  const myFinalizedCount = existingScores.filter((s) => s.finalized).length;
  const totalWeighted = criteria.reduce((sum, c) => {
    const max = Number(c.maxScore);
    const v = values[c.id] ?? 0;
    const weight = Number(c.weight);
    return sum + (max > 0 ? (v / max) * weight : 0);
  }, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (finalized) {
      const confirmed = window.confirm(
        `Chốt điểm cho đội "${submission.teamName}"? Sau khi chốt, điểm sẽ không thể sửa nếu không có ghi log.`,
      );
      if (!confirmed) return;
    }
    const items = criteria.map((c) => ({
      criterionId: c.id,
      scoreValue: values[c.id] ?? 0,
      comment: comments[c.id] ?? undefined,
    }));
    try {
      await api.put(`/api/submissions/${submission.id}/scores`, { items, finalized });
      toast.success(`Đã lưu điểm cho đội "${submission.teamName}".`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="card" style={{ background: "var(--color-bg)" }}>
      <div className="flex between" style={{ cursor: "pointer" }} onClick={() => setExpanded((v) => !v)}>
        <div>
          <strong>{submission.teamName}</strong>{" "}
          {myFinalizedCount === criteria.length && criteria.length > 0 && (
            <span className="badge success">Đã chấm</span>
          )}
        </div>
        <span className="muted">{expanded ? "Thu gọn ▲" : "Chấm điểm ▼"}</span>
      </div>

      {expanded && (
        <div className="section-gap">
          <div className="flex wrap">
            <a href={submission.repoUrl} target="_blank" rel="noreferrer" className="btn small secondary">
              Xem Repo
            </a>
            {submission.demoUrl && (
              <a href={submission.demoUrl} target="_blank" rel="noreferrer" className="btn small secondary">
                Xem Demo
              </a>
            )}
            {submission.docUrl && (
              <a href={submission.docUrl} target="_blank" rel="noreferrer" className="btn small secondary">
                Xem Slide
              </a>
            )}
          </div>

          <form onSubmit={submit} className="section-gap">
            <div className="flex between" style={{ marginBottom: 4 }}>
              <span className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>
                TỔNG ĐIỂM TRỌNG SỐ (ƯỚC TÍNH)
              </span>
              <span style={{ fontFamily: "Lexend, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--color-primary-dark)" }}>
                {totalWeighted.toFixed(1)}
                <small style={{ fontSize: 13, color: "var(--color-text-muted)" }}>/100</small>
              </span>
            </div>
            {criteria.map((c) => (
              <div key={c.id}>
                <ScoreSlider
                  id={`score-${submission.id}-${c.id}`}
                  label={c.name}
                  max={Number(c.maxScore)}
                  weight={Number(c.weight)}
                  value={values[c.id] ?? 0}
                  onChange={(v) => setValues((prev) => ({ ...prev, [c.id]: v }))}
                />
                <input
                  placeholder="Nhận xét (tuỳ chọn)"
                  style={{ marginTop: -6, marginBottom: 12 }}
                  value={comments[c.id] ?? ""}
                  onChange={(e) => setComments((v) => ({ ...v, [c.id]: e.target.value }))}
                />
              </div>
            ))}
            <div className="form-row inline">
              <input
                id={`finalize-${submission.id}`}
                type="checkbox"
                style={{ width: "auto" }}
                checked={finalized}
                onChange={(e) => setFinalized(e.target.checked)}
              />
              <label htmlFor={`finalize-${submission.id}`} style={{ fontWeight: 400 }}>
                Chốt điểm (không thể sửa nếu không có ghi log)
              </label>
            </div>
            <button className="btn small" type="submit" style={{ alignSelf: "flex-start" }}>
              Lưu điểm
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
