import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../api/client";
import type { RoundItem, SubmissionItem, TeamItem } from "../../api/types";

interface DisqualificationEntry {
  id: string;
  targetType: "TEAM" | "SUBMISSION";
  teamId: string | null;
  submissionId: string | null;
  reason: string;
  decidedByName: string;
  decidedAt: string;
  revoked: boolean;
}

export function DisqualificationsTab({ eventId }: { eventId: string }) {
  const [entries, setEntries] = useState<DisqualificationEntry[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [submissions, setSubmissions] = useState<(SubmissionItem & { roundName: string })[]>([]);
  const [targetType, setTargetType] = useState<"TEAM" | "SUBMISSION">("TEAM");
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [entriesRes, teamsRes, roundsRes] = await Promise.all([
      api.get<DisqualificationEntry[]>(`/api/events/${eventId}/disqualifications`),
      api.get<TeamItem[]>(`/api/events/${eventId}/teams`),
      api.get<RoundItem[]>(`/api/events/${eventId}/rounds`),
    ]);
    setEntries(entriesRes.data);
    setTeams(teamsRes.data);

    const subs: (SubmissionItem & { roundName: string })[] = [];
    for (const round of roundsRes.data) {
      const res = await api.get<SubmissionItem[]>(`/api/rounds/${round.id}/submissions`);
      res.data.forEach((s) => subs.push({ ...s, roundName: round.name }));
    }
    setSubmissions(subs);
  }

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!targetId) return;
    try {
      await api.post("/api/disqualifications", {
        targetType,
        teamId: targetType === "TEAM" ? targetId : null,
        submissionId: targetType === "SUBMISSION" ? targetId : null,
        reason,
      });
      setMessage("Đã ghi nhận quyết định loại.");
      setReason("");
      setTargetId("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Loại đội / bài nộp vi phạm quy chế</div>
        <p className="muted" style={{ marginBottom: 14 }}>
          Kết quả liên quan sẽ bị loại khỏi bảng xếp hạng chính thức, lý do được ghi lại vĩnh viễn trong nhật ký kiểm
          tra (audit log).
        </p>
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-3">
            <div className="form-row">
              <label>Đối tượng</label>
              <select
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as "TEAM" | "SUBMISSION");
                  setTargetId("");
                }}
              >
                <option value="TEAM">Đội thi</option>
                <option value="SUBMISSION">Bài nộp</option>
              </select>
            </div>
            <div className="form-row">
              <label>{targetType === "TEAM" ? "Chọn đội" : "Chọn bài nộp"}</label>
              <select required value={targetId} onChange={(e) => setTargetId(e.target.value)}>
                <option value="">-- Chọn --</option>
                {targetType === "TEAM"
                  ? teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))
                  : submissions.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.roundName}] {s.teamName}
                      </option>
                    ))}
              </select>
            </div>
            <div className="form-row">
              <label>Lý do (bắt buộc)</label>
              <input required value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
          <button className="btn danger" type="submit" style={{ alignSelf: "flex-start" }}>
            Xác nhận loại
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-title">Lịch sử quyết định loại</div>
        {entries.length === 0 ? (
          <div className="empty-state">Chưa có quyết định loại nào trong sự kiện này.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Đối tượng</th>
                <th>Lý do</th>
                <th>Người quyết định</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.targetType === "TEAM" ? "Đội thi" : "Bài nộp"}</td>
                  <td>{e.reason}</td>
                  <td>{e.decidedByName}</td>
                  <td className="muted">{new Date(e.decidedAt).toLocaleString("vi-VN")}</td>
                  <td>
                    {e.revoked ? (
                      <span className="badge neutral">Đã thu hồi</span>
                    ) : (
                      <span className="badge danger">Đang hiệu lực</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
