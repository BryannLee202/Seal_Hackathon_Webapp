import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { CriteriaTemplateItem, EventItem, EventStatus } from "../../api/types";

const statusLabel: Record<EventStatus, string> = {
  DRAFT: "Nháp",
  OPEN: "Đang mở đăng ký",
  ONGOING: "Đang diễn ra",
  CLOSED: "Đã kết thúc",
  CANCELLED: "Đã huỷ",
};

const statusBadge: Record<EventStatus, string> = {
  DRAFT: "neutral",
  OPEN: "success",
  ONGOING: "primary",
  CLOSED: "warning",
  CANCELLED: "danger",
};

export function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [templates, setTemplates] = useState<CriteriaTemplateItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [rblEnabled, setRblEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [eventsRes, templatesRes] = await Promise.all([
      api.get<EventItem[]>("/api/events"),
      api.get<CriteriaTemplateItem[]>("/api/criteria-templates"),
    ]);
    setEvents(eventsRes.data);
    setTemplates(templatesRes.data);
    if (!templateId && templatesRes.data.length > 0) {
      setTemplateId(templatesRes.data[0].id);
    }
  }

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/events", {
        name,
        description,
        startDate: startDate || null,
        endDate: endDate || null,
        baseCriteriaTemplateId: templateId || null,
        rblEnabled,
      });
      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function changeStatus(id: string, status: EventStatus) {
    await api.patch(`/api/events/${id}/status`, { status });
    await load();
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Quản lý sự kiện</h1>
          <p className="page-subtitle">Tạo và quản lý các cuộc thi hackathon</p>
        </div>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Đóng" : "+ Tạo sự kiện mới"}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <div className="card">
          <div className="card-title">Sự kiện mới</div>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <label htmlFor="name">Tên sự kiện</label>
              <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-row">
              <label htmlFor="description">Mô tả</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-2">
              <div className="form-row">
                <label htmlFor="startDate">Ngày bắt đầu</label>
                <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="endDate">Ngày kết thúc</label>
                <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="template">Mẫu tiêu chí kế thừa</label>
              <select id="template" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row inline">
              <input
                id="rbl"
                type="checkbox"
                style={{ width: "auto" }}
                checked={rblEnabled}
                onChange={(e) => setRblEnabled(e.target.checked)}
              />
              <label htmlFor="rbl" style={{ fontWeight: 400 }}>
                Bật mô-đun nghiên cứu RBL (thu thập dữ liệu độ tin cậy liên đánh giá viên)
              </label>
            </div>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Tạo sự kiện"}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {events.length === 0 ? (
          <div className="empty-state">Chưa có sự kiện nào. Tạo sự kiện đầu tiên để bắt đầu.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tên sự kiện</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>RBL</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <Link to={`/coordinator/events/${ev.id}`}>{ev.name}</Link>
                  </td>
                  <td className="muted">
                    {ev.startDate ?? "?"} → {ev.endDate ?? "?"}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge[ev.status]}`}>{statusLabel[ev.status]}</span>
                  </td>
                  <td>{ev.rblEnabled ? <span className="badge primary">Có</span> : <span className="muted">—</span>}</td>
                  <td>
                    <select
                      value={ev.status}
                      onChange={(e) => changeStatus(ev.id, e.target.value as EventStatus)}
                      style={{ width: "auto" }}
                    >
                      {Object.entries(statusLabel).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
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
