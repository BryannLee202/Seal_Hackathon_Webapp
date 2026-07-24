import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../api/client";
import type { CalibrationRoundItem, CalibrationScoreEntry, RoundItem, SubmissionItem } from "../../api/types";

interface SubmissionOption extends SubmissionItem {
  roundName: string;
}

export function CalibrationTab({ eventId }: { eventId: string }) {
  const [calibrationRounds, setCalibrationRounds] = useState<CalibrationRoundItem[]>([]);
  const [submissionOptions, setSubmissionOptions] = useState<SubmissionOption[]>([]);
  const [name, setName] = useState("");
  const [sampleSubmissionId, setSampleSubmissionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    const [crRes, roundsRes] = await Promise.all([
      api.get<CalibrationRoundItem[]>(`/api/events/${eventId}/calibration-rounds`),
      api.get<RoundItem[]>(`/api/events/${eventId}/rounds`),
    ]);
    setCalibrationRounds(crRes.data);

    const options: SubmissionOption[] = [];
    for (const round of roundsRes.data) {
      const subs = await api.get<SubmissionItem[]>(`/api/rounds/${round.id}/submissions`);
      subs.data.forEach((s) => options.push({ ...s, roundName: round.name }));
    }
    setSubmissionOptions(options);
    if (!sampleSubmissionId && options.length > 0) setSampleSubmissionId(options[0].id);
  }

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await api.post(`/api/events/${eventId}/calibration-rounds`, { name, sampleSubmissionId });
      setName("");
      setMessage("Đã tạo vòng hiệu chuẩn.");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Tạo vòng hiệu chuẩn (Calibration)</div>
        <p className="muted" style={{ marginBottom: 14 }}>
          Trước khi chấm chính thức, mời toàn bộ giám khảo chấm thử một bài mẫu để đối chiếu mức độ đồng thuận về cách
          hiểu tiêu chí.
        </p>
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}
        {submissionOptions.length === 0 ? (
          <div className="muted">Cần có ít nhất một bài nộp trong sự kiện để chọn làm bài mẫu.</div>
        ) : (
          <form onSubmit={handleCreate}>
            <div className="grid grid-2">
              <div className="form-row">
                <label>Tên vòng hiệu chuẩn</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Hiệu chuẩn vòng loại" />
              </div>
              <div className="form-row">
                <label>Bài nộp mẫu</label>
                <select value={sampleSubmissionId} onChange={(e) => setSampleSubmissionId(e.target.value)}>
                  {submissionOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.roundName}] {s.teamName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>
              Tạo vòng hiệu chuẩn
            </button>
          </form>
        )}
      </div>

      {calibrationRounds.length === 0 ? (
        <div className="card empty-state">Chưa có vòng hiệu chuẩn nào.</div>
      ) : (
        calibrationRounds.map((cr) => (
          <div className="card" key={cr.id}>
            <div className="flex between" style={{ cursor: "pointer" }} onClick={() => setExpanded(expanded === cr.id ? null : cr.id)}>
              <strong>{cr.name}</strong>
              <span className="badge neutral">{expanded === cr.id ? "Thu gọn ▲" : "Xem phân bố điểm ▼"}</span>
            </div>
            {expanded === cr.id && <CalibrationDistribution calibrationRoundId={cr.id} />}
          </div>
        ))
      )}
    </div>
  );
}

function CalibrationDistribution({ calibrationRoundId }: { calibrationRoundId: string }) {
  const [entries, setEntries] = useState<CalibrationScoreEntry[]>([]);

  useEffect(() => {
    api
      .get<CalibrationScoreEntry[]>(`/api/calibration-rounds/${calibrationRoundId}/distribution`)
      .then((res) => setEntries(res.data));
  }, [calibrationRoundId]);

  if (entries.length === 0) {
    return <div className="muted section-gap">Chưa có giám khảo nào chấm bài mẫu này.</div>;
  }

  return (
    <table className="section-gap">
      <thead>
        <tr>
          <th>Giám khảo</th>
          <th>Tiêu chí</th>
          <th>Điểm</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e, idx) => (
          <tr key={idx}>
            <td>{e.judgeName}</td>
            <td>{e.criterionName}</td>
            <td>{e.scoreValue}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
