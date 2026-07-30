import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../api/client";
import type { Page, UserSummary } from "../../api/types";

const categoryLabel: Record<string, string> = {
  FPT_STUDENT: "Sinh viên FPT",
  EXTERNAL_STUDENT: "Sinh viên ngoài trường",
  STAFF: "Nhân sự / BTC",
};

interface GuestJudgeCreated {
  userId: string;
  fullName: string;
  email: string;
  temporaryPassword: string;
}

export function UsersApprovalPage() {
  const [pending, setPending] = useState<UserSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestExpiry, setGuestExpiry] = useState("");
  const [createdGuest, setCreatedGuest] = useState<GuestJudgeCreated | null>(null);

  async function load() {
    const { data } = await api.get<Page<UserSummary>>("/api/admin/users/pending");
    setPending(data.content);
  }

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
  }, []);

  async function approve(id: string, approveDecision: boolean) {
    setError(null);
    setMessage(null);
    let rejectionReason: string | undefined;
    if (!approveDecision) {
      rejectionReason = window.prompt("Lý do từ chối:") ?? undefined;
      if (!rejectionReason) return;
    }
    try {
      await api.post(`/api/admin/users/${id}/approval`, { approve: approveDecision, rejectionReason });
      setMessage(approveDecision ? "Đã phê duyệt tài khoản." : "Đã từ chối tài khoản.");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function createGuestJudge(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreatedGuest(null);
    try {
      const { data } = await api.post<GuestJudgeCreated>("/api/admin/users/guest-judges", {
        fullName: guestName,
        email: guestEmail,
        guestAccessExpiresAt: guestExpiry ? new Date(guestExpiry).toISOString() : null,
      });
      setCreatedGuest(data);
      setGuestName("");
      setGuestEmail("");
      setGuestExpiry("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Duyệt tài khoản</h1>
          <p className="page-subtitle">Danh sách tài khoản đang chờ Ban tổ chức phê duyệt</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <div className="card">
        <div className="card-title">Tạo tài khoản Giám khảo khách mời</div>
        <p className="muted" style={{ marginBottom: 14 }}>
          Tài khoản tạm thời, được phê duyệt sẵn, chỉ dùng để chấm điểm các vòng thi được phân công. Mật khẩu tạm
          thời sẽ chỉ hiển thị một lần, hãy gửi lại cho giám khảo qua kênh riêng.
        </p>
        {createdGuest && (
          <div className="alert success">
            Đã tạo tài khoản <strong>{createdGuest.email}</strong>, mật khẩu tạm:{" "}
            <code style={{ fontWeight: 700 }}>{createdGuest.temporaryPassword}</code>
          </div>
        )}
        <form onSubmit={createGuestJudge}>
          <div className="grid grid-3">
            <div className="form-row">
              <label>Họ tên</label>
              <input required value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input required type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Hạn truy cập (tuỳ chọn)</label>
              <input type="datetime-local" value={guestExpiry} onChange={(e) => setGuestExpiry(e.target.value)} />
            </div>
          </div>
          <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>
            Tạo tài khoản
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-title">Tài khoản chờ duyệt</div>
        {pending.length === 0 ? (
          <div className="empty-state">Không có tài khoản nào đang chờ duyệt.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Loại</th>
                <th>MSSV</th>
                <th>Trường</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{categoryLabel[u.userCategory] ?? u.userCategory}</td>
                  <td>{u.studentCode ?? "-"}</td>
                  <td>{u.schoolName ?? "-"}</td>
                  <td>
                    <div className="flex">
                      <button className="btn small" onClick={() => approve(u.id, true)}>
                        Duyệt
                      </button>
                      <button className="btn danger small" onClick={() => approve(u.id, false)}>
                        Từ chối
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
