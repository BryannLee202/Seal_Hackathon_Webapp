import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../api/client";
import type { RoundItem } from "../../api/types";
import { RoundPanel } from "./RoundPanel";

export function RoundsTab({ eventId, rblEnabled }: { eventId: string; rblEnabled: boolean }) {
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [orderIndex, setOrderIndex] = useState("1");
  const [deadline, setDeadline] = useState("");
  const [promotionTopN, setPromotionTopN] = useState("");

  async function load() {
    const { data } = await api.get<RoundItem[]>(`/api/events/${eventId}/rounds`);
    setRounds(data);
  }

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post(`/api/events/${eventId}/rounds`, {
        name,
        orderIndex: Number(orderIndex),
        submissionDeadline: new Date(deadline).toISOString(),
        promotionTopN: promotionTopN ? Number(promotionTopN) : null,
      });
      setName("");
      setDeadline("");
      setPromotionTopN("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Tạo vòng thi mới</div>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="grid grid-4">
            <div className="form-row">
              <label>Tên vòng</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Thứ tự</label>
              <input type="number" min={1} required value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Hạn nộp bài</label>
              <input type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Top N thăng vòng</label>
              <input
                type="number"
                min={1}
                placeholder="Vòng cuối để trống"
                value={promotionTopN}
                onChange={(e) => setPromotionTopN(e.target.value)}
              />
            </div>
          </div>
          <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>
            Tạo vòng thi
          </button>
        </form>
      </div>

      {rounds.length === 0 ? (
        <div className="card empty-state">Chưa có vòng thi nào.</div>
      ) : (
        rounds.map((r) => (
          <div className="card" key={r.id}>
            <div className="flex between" style={{ cursor: "pointer" }} onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
              <div>
                <div style={{ fontWeight: 700 }}>
                  #{r.orderIndex} {r.name}
                </div>
                <div className="muted">
                  Hạn nộp: {new Date(r.submissionDeadline).toLocaleString("vi-VN")}
                  {r.promotionTopN ? ` • Top ${r.promotionTopN} thăng vòng` : ""}
                </div>
              </div>
              <span className="badge neutral">{expanded === r.id ? "Thu gọn ▲" : "Chi tiết ▼"}</span>
            </div>
            {expanded === r.id && (
              <div className="section-gap">
                <RoundPanel round={r} rblEnabled={rblEnabled} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
