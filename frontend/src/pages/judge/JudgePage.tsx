import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type {
  CalibrationRoundItem,
  CriterionItem,
  Page,
  RoundItem,
  ScoreItem,
  SubmissionItem,
} from "../../api/types";
import { EmptyState } from "../../components/EmptyState";
import { toast } from "../../components/Toast";

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
    })();
  }, [roundIds]);

  if (rounds.length === 0) return null;

  return (
    <div className="card" style={{ borderLeft: "4px solid var(--color-primary)" }}>
      <div className="card-title">Vòng hiệu chuẩn (Calibration) — Nghiên cứu RBL</div>
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
  const [values, setValues] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const items = criteria.map((c) => ({ criterionId: c.id, scoreValue: Number(values[c.id] ?? 0) }));
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
      <div className="grid grid-2">
        {criteria.map((c) => (
          <div className="form-row" key={c.id}>
            <label>
              {c.name} (0 - {c.maxScore})
            </label>
            <input
              type="number"
              min={0}
              max={c.maxScore}
              step={0.5}
              required
              className="score-input"
              value={values[c.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [c.id]: e.target.value }))}
            />
          </div>
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
    load();
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
  const [values, setValues] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [finalized, setFinalized] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    api.get<ScoreItem[]>(`/api/submissions/${submission.id}/scores`).then((res) => {
      setExistingScores(res.data);
      const v: Record<string, string> = {};
      const c: Record<string, string> = {};
      res.data.forEach((s) => {
        v[s.criterionId] = String(s.scoreValue);
        c[s.criterionId] = s.comment ?? "";
      });
      setValues(v);
      setComments(c);
    });
  }, [submission.id]);

  const myFinalizedCount = existingScores.filter((s) => s.finalized).length;

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
      scoreValue: Number(values[c.id] ?? 0),
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
            {criteria.map((c) => (
              <div className="form-row" key={c.id}>
                <label>
                  {c.name} (0 - {c.maxScore}, trọng số {c.weight}%)
                </label>
                <div className="flex score-row">
                  <input
                    type="number"
                    min={0}
                    max={c.maxScore}
                    step={0.5}
                    required
                    className="score-input"
                    style={{ width: 100 }}
                    value={values[c.id] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [c.id]: e.target.value }))}
                  />
                  <input
                    placeholder="Nhận xét (tuỳ chọn)"
                    value={comments[c.id] ?? ""}
                    onChange={(e) => setComments((v) => ({ ...v, [c.id]: e.target.value }))}
                  />
                </div>
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
