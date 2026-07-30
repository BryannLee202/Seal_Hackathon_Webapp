import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { EventItem, RankingItem, RoundItem } from "../../api/types";
import { EmptyState } from "../../components/EmptyState";

const MEDALS = ["gold", "silver", "bronze"] as const;

export function RankingPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [roundId, setRoundId] = useState("");
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<EventItem[]>("/api/events")
      .then((res) => {
        setEvents(res.data);
        if (res.data.length > 0) setEventId(res.data[0].id);
      })
      .catch((err) => setError((err as Error).message));
  }, []);

  useEffect(() => {
    if (!eventId) return;
    api.get<RoundItem[]>(`/api/events/${eventId}/rounds`).then((res) => {
      setRounds(res.data);
      if (res.data.length > 0) setRoundId(res.data[res.data.length - 1].id);
      else setRoundId("");
    });
  }, [eventId]);

  useEffect(() => {
    if (!roundId) {
      setRankings([]);
      return;
    }
    setLoadingRankings(true);
    api
      .get<RankingItem[]>(`/api/rounds/${roundId}/rankings`)
      .then((res) => setRankings(res.data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoadingRankings(false));
  }, [roundId]);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Bảng xếp hạng</h1>
          <p className="page-subtitle">Kết quả xếp hạng theo từng vòng thi</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card">
        <div className="grid grid-2">
          <div className="form-row">
            <label>Sự kiện</label>
            <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Vòng thi</label>
            <select value={roundId} onChange={(e) => setRoundId(e.target.value)}>
              {rounds.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.orderIndex} {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loadingRankings ? (
          <div className="form-row" style={{ gap: 14 }}>
            <div className="skeleton-line w-full" />
            <div className="skeleton-line w-80" />
            <div className="skeleton-line w-60" />
            <div className="skeleton-line w-80" />
            <div className="skeleton-line w-40" />
          </div>
        ) : rankings.length === 0 ? (
          <EmptyState
            title="Chưa có kết quả xếp hạng"
            description="Bảng xếp hạng sẽ xuất hiện ngay khi vòng thi này có điểm chấm đầu tiên."
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Hạng chung</th>
                <th>Đội thi</th>
                <th>Hạng mục</th>
                <th>Hạng trong Hạng mục</th>
                <th>Điểm tổng có trọng số</th>
                <th>Thăng vòng</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r) => (
                <tr key={r.teamId}>
                  <td>
                    {r.rankOverall != null && r.rankOverall <= 3 ? (
                      <span className={`rank-medal ${MEDALS[r.rankOverall - 1]}`}>{r.rankOverall}</span>
                    ) : (
                      <strong>{r.rankOverall ?? "-"}</strong>
                    )}
                  </td>
                  <td>{r.teamName}</td>
                  <td>{r.trackName ?? "-"}</td>
                  <td>{r.rankInTrack ?? "-"}</td>
                  <td>{r.totalWeightedScore}</td>
                  <td>
                    {r.promoted ? <span className="badge success">Thăng vòng</span> : <span className="muted">-</span>}
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
