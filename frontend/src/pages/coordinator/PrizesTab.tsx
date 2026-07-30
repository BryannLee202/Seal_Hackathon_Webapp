import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../api/client";
import type { PrizeItem, RoundItem, TrackItem } from "../../api/types";

export function PrizesTab({ eventId }: { eventId: string }) {
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [name, setName] = useState("");
  const [trackId, setTrackId] = useState("");
  const [rankCondition, setRankCondition] = useState("1");
  const [finalRoundId, setFinalRoundId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [p, t, r] = await Promise.all([
      api.get<PrizeItem[]>(`/api/events/${eventId}/prizes`),
      api.get<TrackItem[]>(`/api/events/${eventId}/tracks`),
      api.get<RoundItem[]>(`/api/events/${eventId}/rounds`),
    ]);
    setPrizes(p.data);
    setTracks(t.data);
    setRounds(r.data);
    if (!finalRoundId && r.data.length > 0) {
      setFinalRoundId(r.data[r.data.length - 1].id);
    }
  }

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post(`/api/events/${eventId}/prizes`, {
        name,
        trackId: trackId || null,
        rankCondition: Number(rankCondition),
      });
      setName("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function autoAssign() {
    setError(null);
    setMessage(null);
    if (!finalRoundId) return;
    try {
      await api.post(`/api/events/${eventId}/prizes/auto-assign?finalRoundId=${finalRoundId}`);
      setMessage("Đã gán giải thưởng theo bảng xếp hạng vòng chung kết.");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Cấu hình giải thưởng</div>
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}
        <form onSubmit={handleCreate}>
          <div className="grid grid-3">
            <div className="form-row">
              <label>Tên giải</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Giải Nhất" />
            </div>
            <div className="form-row">
              <label>Hạng mục (để trống = toàn sự kiện)</label>
              <select value={trackId} onChange={(e) => setTrackId(e.target.value)}>
                <option value="">Toàn sự kiện</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Điều kiện thứ hạng</label>
              <input type="number" min={1} required value={rankCondition} onChange={(e) => setRankCondition(e.target.value)} />
            </div>
          </div>
          <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>
            Thêm giải thưởng
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex between">
          <div className="card-title" style={{ marginBottom: 0 }}>
            Tự động gán giải theo vòng chung kết
          </div>
          <div className="flex">
            <select value={finalRoundId} onChange={(e) => setFinalRoundId(e.target.value)} style={{ width: 220 }}>
              {rounds.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button className="btn small" onClick={autoAssign}>
              Gán giải tự động
            </button>
          </div>
        </div>

        <table className="section-gap">
          <thead>
            <tr>
              <th>Giải</th>
              <th>Phạm vi</th>
              <th>Thứ hạng</th>
              <th>Đội được trao</th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.trackId ? tracks.find((t) => t.id === p.trackId)?.name ?? "-" : "Toàn sự kiện"}</td>
                <td>#{p.rankCondition}</td>
                <td>{p.awardedTeamName ?? <span className="muted">Chưa gán</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
