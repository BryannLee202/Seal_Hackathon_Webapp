import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";
import type { FeedbackMessageItem } from "../api/types";

export function FeedbackThread({ teamId }: { teamId: string }) {
  const [messages, setMessages] = useState<FeedbackMessageItem[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function load() {
    const res = await api.get<FeedbackMessageItem[]>(`/api/teams/${teamId}/messages`);
    setMessages(res.data);
  }

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    setSending(true);
    try {
      await api.post(`/api/teams/${teamId}/messages`, { body });
      setBody("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {error && <div className="alert error">{error}</div>}
      {messages.length === 0 ? (
        <div className="muted" style={{ fontSize: 13, padding: "8px 0" }}>
          Chưa có trao đổi nào.
        </div>
      ) : (
        <div className="audit-timeline">
          {messages.map((m) => (
            <div className="audit-timeline-item" key={m.id}>
              <div className={`audit-timeline-dot badge-dot-${m.authorRole === "MENTOR" ? "primary" : "success"}`} />
              <div className="audit-timeline-body">
                <div className="flex between wrap" style={{ gap: 8 }}>
                  <div>
                    <span className={`badge ${m.authorRole === "MENTOR" ? "primary" : "success"}`}>
                      {m.authorRole === "MENTOR" ? "Mentor" : "Đội thi"}
                    </span>{" "}
                    <span style={{ fontWeight: 700 }}>{m.authorName}</span>
                  </div>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {new Date(m.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div style={{ fontSize: 13.6, marginTop: 4, whiteSpace: "pre-wrap" }}>{m.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="section-gap flex" style={{ flexDirection: "row" }}>
        <textarea
          placeholder="Viết phản hồi..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ minHeight: 44 }}
        />
        <button className="btn small" type="submit" disabled={sending || !body.trim()}>
          Gửi
        </button>
      </form>
    </div>
  );
}
