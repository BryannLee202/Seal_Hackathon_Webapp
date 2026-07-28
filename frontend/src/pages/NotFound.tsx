import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="landing">
      <div className="l-container" style={{ padding: "96px 0", textAlign: "center" }}>
        <h1 className="l-hero-title">404</h1>
        <p className="l-hero-subtitle">Không tìm thấy trang bạn yêu cầu.</p>
        <Link className="l-btn-primary" to="/">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
