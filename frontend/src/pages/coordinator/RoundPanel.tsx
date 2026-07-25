import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { CriterionItem, JudgeType, Page, RankingItem, RoundItem, SubmissionItem, VarianceStat } from "../../api/types";
import { PersonPicker } from "../../components/PersonPicker";

const BFF_URL = import.meta.env.VITE_BFF_URL ?? "http://localhost:4001";

export function RoundPanel({ round, rblEnabled }: { round: RoundItem; rblEnabled: boolean }) {
  const [criteria, setCriteria] = useState<CriterionItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [variance, setVariance] = useState<VarianceStat[]>([]);
  const [judgeUserId, setJudgeUserId] = useState("");
  const [judgeType, setJudgeType] = useState<JudgeType>("INTERNAL");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [published, setPublished] = useState(round.resultsPublished);

  async function load() {
    const [c, s, r] = await Promise.all([
      api.get<CriterionItem[]>(`/api/rounds/${round.id}/criteria`),
      api.get<Page<SubmissionItem>>(`/api/rounds/${round.id}/submissions`),
      api.get<RankingItem[]>(`/api/rounds/${round.id}/rankings`),
    ]);
    setCriteria(c.data);
    setSubmissions(s.data.content);
    setRankings(r.data);
    if (rblEnabled) {
      const v = await api.get<VarianceStat[]>(`/api/rounds/${round.id}/rbl/variance`);
      setVariance(v.data);
    }
  }

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round.id]);

  async function assignJudge() {
    setError(null);
    setMessage(null);
    try {
      await api.post(`/api/rounds/${round.id}/judges`, { judgeUserId, judgeType });
      setMessage("Đã phân công giám khảo.");
      setJudgeUserId("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function computeRanking() {
    setError(null);
    try {
      const { data } = await api.post<RankingItem[]>(`/api/rounds/${round.id}/rankings/compute`);
      setRankings(data);
      setMessage("Đã tính xếp hạng.");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function publishResults() {
    setError(null);
    try {
      await api.post(`/api/rounds/${round.id}/publish-results`);
      setPublished(true);
      setMessage("Đã công bố kết quả.");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="card" style={{ background: "var(--color-bg)" }}>
      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <div className="grid grid-2">
        <div>
          <div className="card-title">Tiêu chí chấm điểm ({criteria.length})</div>
          <table>
            <thead>
              <tr>
                <th>Tiêu chí</th>
                <th>Trọng số</th>
                <th>Thang điểm</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.weight}%</td>
                  <td>{c.maxScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="card-title">Phân công giám khảo</div>
          <div className="flex wrap">
            <PersonPicker value={judgeUserId} onChange={(id) => setJudgeUserId(id)} placeholder="Tìm giám khảo..." />
            <select value={judgeType} onChange={(e) => setJudgeType(e.target.value as JudgeType)} style={{ width: 160 }}>
              <option value="INTERNAL">Nội bộ</option>
              <option value="GUEST">Khách mời</option>
            </select>
            <button className="btn small" onClick={assignJudge} disabled={!judgeUserId}>
              Phân công
            </button>
          </div>
        </div>
      </div>

      <div className="section-gap">
        <div className="card-title">Bài nộp ({submissions.length})</div>
        {submissions.length === 0 ? (
          <div className="muted">Chưa có đội nào nộp bài.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Đội</th>
                <th>Repository</th>
                <th>Demo</th>
                <th>Nộp lúc</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td>{s.teamName}</td>
                  <td>
                    <a href={s.repoUrl} target="_blank" rel="noreferrer">
                      Repo
                    </a>
                  </td>
                  <td>
                    {s.demoUrl ? (
                      <a href={s.demoUrl} target="_blank" rel="noreferrer">
                        Demo
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="muted">{new Date(s.submittedAt).toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-gap">
        <div className="flex between">
          <div className="card-title" style={{ marginBottom: 0 }}>
            Bảng xếp hạng ({rankings.length})
          </div>
          <div className="flex">
            <button className="btn small secondary" onClick={computeRanking}>
              Tính lại xếp hạng
            </button>
            <a className="btn small secondary" href={`${BFF_URL}/api/rounds/${round.id}/rankings/export.xlsx`}>
              Xuất Excel
            </a>
            {!published && (
              <button className="btn small" onClick={publishResults}>
                Công bố kết quả
              </button>
            )}
            {published && <span className="badge success">Đã công bố</span>}
          </div>
        </div>
        {rankings.length > 0 && (
          <table className="section-gap">
            <thead>
              <tr>
                <th>#</th>
                <th>Đội</th>
                <th>Hạng mục</th>
                <th>Điểm tổng</th>
                <th>Hạng/Hạng mục</th>
                <th>Thăng vòng</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r) => (
                <tr key={r.teamId}>
                  <td>{r.rankOverall}</td>
                  <td>{r.teamName}</td>
                  <td>{r.trackName ?? "—"}</td>
                  <td>{r.totalWeightedScore}</td>
                  <td>{r.rankInTrack ?? "—"}</td>
                  <td>{r.promoted ? <span className="badge success">Có</span> : <span className="muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rblEnabled && (
        <div className="section-gap">
          <div className="flex between">
            <div className="card-title" style={{ marginBottom: 0 }}>
              Dashboard phương sai điểm (RBL)
            </div>
            <a className="btn small secondary" href={`${BFF_URL}/api/rounds/${round.id}/rbl/export.csv`}>
              Xuất CSV ẩn danh
            </a>
          </div>
          {variance.length > 0 && (
            <table className="section-gap">
              <thead>
                <tr>
                  <th>Tiêu chí</th>
                  <th>Số mẫu</th>
                  <th>Trung bình</th>
                  <th>Độ lệch chuẩn</th>
                  <th>Min - Max</th>
                </tr>
              </thead>
              <tbody>
                {variance.map((v) => (
                  <tr key={v.criterionId}>
                    <td>{v.criterionName}</td>
                    <td>{v.sampleCount}</td>
                    <td>{v.mean ?? "—"}</td>
                    <td>{v.stdDev ?? "—"}</td>
                    <td>
                      {v.min ?? "—"} - {v.max ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
