import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { RoleName } from "../api/types";
import { IconCalendar, IconGavel, IconShieldCheck, IconUsers } from "../components/icons";
import type { ReactNode } from "react";

export function DashboardPage() {
  const { user, hasRole, refreshPermissions } = useAuth();

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Xin chào, {user?.fullName} 👋</h1>
          <p className="page-subtitle">Đây là vai trò hiện tại của bạn trong hệ thống</p>
        </div>
        <button className="btn secondary small" onClick={refreshPermissions}>
          Làm mới quyền truy cập
        </button>
      </div>

      <div className="grid grid-3">
        {user?.roles.map((r, idx) => (
          <div className={`stat-tile${idx === 0 ? " featured" : ""}`} key={idx}>
            <div className="icon-chip">{roleIcon(r.roleName)}</div>
            <div className="value">{roleLabel(r.roleName)}</div>
            <div className="label">
              Phạm vi: {scopeLabel(r.scopeType)}
              {r.judgeType ? ` • ${r.judgeType === "GUEST" ? "Giám khảo khách mời" : "Giám khảo nội bộ"}` : ""}
            </div>
          </div>
        ))}
      </div>

      <div className="card section-gap">
        <div className="card-title">Lối tắt</div>
        <div className="flex wrap">
          {hasRole("COORDINATOR") && (
            <>
              <Link className="btn secondary small" to="/coordinator/events">
                Quản lý sự kiện
              </Link>
              <Link className="btn secondary small" to="/coordinator/users">
                Duyệt tài khoản
              </Link>
            </>
          )}
          {(hasRole("TEAM_MEMBER") || hasRole("TEAM_LEADER")) && (
            <Link className="btn secondary small" to="/my-team">
              Đội thi của tôi
            </Link>
          )}
          {hasRole("JUDGE") && (
            <Link className="btn secondary small" to="/judge">
              Chấm điểm
            </Link>
          )}
          <Link className="btn secondary small" to="/rankings">
            Bảng xếp hạng
          </Link>
        </div>
      </div>
    </div>
  );
}

function roleLabel(role: string) {
  switch (role) {
    case "COORDINATOR":
      return "Ban tổ chức";
    case "MENTOR":
      return "Mentor";
    case "JUDGE":
      return "Giám khảo";
    case "TEAM_LEADER":
      return "Đội trưởng";
    case "TEAM_MEMBER":
      return "Thành viên đội";
    default:
      return role;
  }
}

function scopeLabel(scope: string) {
  switch (scope) {
    case "GLOBAL":
      return "Toàn hệ thống";
    case "EVENT":
      return "Sự kiện";
    case "TRACK":
      return "Hạng mục";
    case "ROUND":
      return "Vòng thi";
    default:
      return scope;
  }
}

function roleIcon(role: RoleName): ReactNode {
  switch (role) {
    case "COORDINATOR":
      return <IconShieldCheck />;
    case "JUDGE":
      return <IconGavel />;
    case "TEAM_LEADER":
    case "TEAM_MEMBER":
      return <IconUsers />;
    default:
      return <IconCalendar />;
  }
}
