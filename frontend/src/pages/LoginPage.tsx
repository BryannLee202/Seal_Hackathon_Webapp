import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconArrowRight, IconCalendar, IconGavel, IconTrophy } from "../components/icons";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <AuthHero />
      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Chào mừng trở lại</h1>
          <p className="subtitle">Đăng nhập để tiếp tục quản lý cuộc thi SEAL Hackathon</p>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-row">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
              {!submitting && <IconArrowRight width={15} height={15} />}
            </button>
          </form>
          <div className="auth-footer">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthHero() {
  return (
    <div className="auth-hero">
      <div className="auth-hero-content">
        <div className="auth-hero-brand">
          <div className="auth-hero-mark">🏆</div>
          SEAL Hackathon
        </div>
        <div className="auth-hero-title">Điều phối cuộc thi hackathon, minh bạch từ vòng loại đến chung kết.</div>
        <div className="auth-hero-subtitle">
          Đăng ký đội thi, chấm điểm theo tiêu chí, xếp hạng tự động và nhật ký kiểm tra đầy đủ — tất cả trong một
          nền tảng duy nhất.
        </div>
      </div>
      <div className="auth-hero-features">
        <div className="auth-hero-feature">
          <span className="dot">
            <IconCalendar width={14} height={14} />
          </span>
          Quản lý sự kiện, hạng mục & nhiều vòng thi
        </div>
        <div className="auth-hero-feature">
          <span className="dot">
            <IconGavel width={14} height={14} />
          </span>
          Chấm điểm theo tiêu chí, ghi log minh bạch
        </div>
        <div className="auth-hero-feature">
          <span className="dot">
            <IconTrophy width={14} height={14} />
          </span>
          Xếp hạng & thăng vòng tự động, tức thời
        </div>
      </div>
    </div>
  );
}
