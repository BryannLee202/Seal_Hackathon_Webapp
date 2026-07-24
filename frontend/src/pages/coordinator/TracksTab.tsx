import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../api/client";
import type { TrackItem } from "../../api/types";
import { PersonPicker } from "../../components/PersonPicker";

export function TracksTab({ eventId }: { eventId: string }) {
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxTeams, setMaxTeams] = useState("");
  const [mentorIdByTrack, setMentorIdByTrack] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const { data } = await api.get<TrackItem[]>(`/api/events/${eventId}/tracks`);
    setTracks(data);
  }

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post(`/api/events/${eventId}/tracks`, {
        name,
        description,
        maxTeams: maxTeams ? Number(maxTeams) : null,
      });
      setName("");
      setDescription("");
      setMaxTeams("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function assignMentor(trackId: string) {
    const mentorUserId = mentorIdByTrack[trackId];
    if (!mentorUserId) return;
    setError(null);
    setMessage(null);
    try {
      await api.post(`/api/tracks/${trackId}/mentors`, { mentorUserId });
      setMessage("Đã phân công Mentor.");
      setMentorIdByTrack((m) => ({ ...m, [trackId]: "" }));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Tạo Hạng mục mới</div>
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}
        <form onSubmit={handleCreate}>
          <div className="grid grid-3">
            <div className="form-row">
              <label>Tên Hạng mục</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Mô tả</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Số đội tối đa (tuỳ chọn)</label>
              <input type="number" min={1} value={maxTeams} onChange={(e) => setMaxTeams(e.target.value)} />
            </div>
          </div>
          <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>
            Tạo Hạng mục
          </button>
        </form>
      </div>

      <div className="card">
        {tracks.length === 0 ? (
          <div className="empty-state">Chưa có Hạng mục nào.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Mô tả</th>
                <th>Giới hạn đội</th>
                <th>Phân công Mentor</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td className="muted">{t.description ?? "—"}</td>
                  <td>{t.maxTeams ?? "Không giới hạn"}</td>
                  <td>
                    <div className="flex">
                      <PersonPicker
                        value={mentorIdByTrack[t.id] ?? ""}
                        onChange={(id) => setMentorIdByTrack((m) => ({ ...m, [t.id]: id }))}
                        placeholder="Tìm giảng viên..."
                      />
                      <button
                        className="btn small secondary"
                        onClick={() => assignMentor(t.id)}
                        disabled={!mentorIdByTrack[t.id]}
                      >
                        Gán
                      </button>
                    </div>
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
