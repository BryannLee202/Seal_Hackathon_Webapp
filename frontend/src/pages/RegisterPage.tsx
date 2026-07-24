import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { UserCategory } from "../api/types";
import { AuthHero } from "./LoginPage";
import { IconArrowRight } from "../components/icons";

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userCategory, setUserCategory] = useState<UserCategory>("FPT_STUDENT");
  const [studentCode, setStudentCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/auth/register", {
        fullName,
        email,
        password,
        userCategory,
        studentCode,
        schoolName: userCategory === "EXTERNAL_STUDENT" ? schoolName : undefined,
      });
      navigate("/login", { state: { registered: true } });
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
        <h1>Đăng ký tài khoản</h1>
        <p className="subtitle">Tài khoản cần được Ban tổ chức phê duyệt trước khi tham gia thi</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="fullName">Họ và tên</label>
            <input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="password">Mật khẩu (tối thiểu 8 ký tự)</label>
            <input
              id="password"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="userCategory">Loại tài khoản</label>
            <select
              id="userCategory"
              value={userCategory}
              onChange={(e) => setUserCategory(e.target.value as UserCategory)}
            >
              <option value="FPT_STUDENT">Sinh viên FPT</option>
              <option value="EXTERNAL_STUDENT">Sinh viên ngoài trường</option>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="studentCode">Mã số sinh viên</label>
            <input id="studentCode" required value={studentCode} onChange={(e) => setStudentCode(e.target.value)} />
          </div>
          {userCategory === "EXTERNAL_STUDENT" && (
            <div className="form-row">
              <label htmlFor="schoolName">Tên trường</label>
              <input
                id="schoolName"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
          )}
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Đăng ký"}
            {!submitting && <IconArrowRight width={15} height={15} />}
          </button>
        </form>
        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
      </div>
    </div>
  );
}
