import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  IconCalendar,
  IconGavel,
  IconHistory,
  IconHome,
  IconLogOut,
  IconMessageCircle,
  IconShieldCheck,
  IconTrophy,
  IconUsers,
} from "./icons";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { to: "/app", label: "Trang chủ", icon: <IconHome /> },
    { to: "/rankings", label: "Bảng xếp hạng", icon: <IconTrophy /> },
  ];
  if (hasRole("COORDINATOR")) {
    navItems.push(
      { to: "/coordinator/events", label: "Quản lý sự kiện", icon: <IconCalendar /> },
      { to: "/coordinator/users", label: "Duyệt tài khoản", icon: <IconShieldCheck /> },
      { to: "/coordinator/audit-log", label: "Nhật ký kiểm tra", icon: <IconHistory /> },
    );
  }
  if (hasRole("TEAM_MEMBER") || hasRole("TEAM_LEADER")) {
    navItems.push({ to: "/my-team", label: "Đội thi của tôi", icon: <IconUsers /> });
  }
  if (hasRole("JUDGE")) {
    navItems.push({ to: "/judge", label: "Chấm điểm", icon: <IconGavel /> });
  }
  if (hasRole("MENTOR")) {
    navItems.push({ to: "/mentor", label: "Đội được phân công", icon: <IconMessageCircle /> });
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const initials = (user?.fullName ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">SH</div>
          <div className="sidebar-brand-text">
            SEAL Hackathon
            <small>Quản lý cuộc thi</small>
          </div>
        </div>

        <div className="nav-section-label">Điều hướng</div>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn secondary small sidebar-logout-btn" onClick={handleLogout}>
            <IconLogOut width={15} height={15} />
            <span className="btn-label">Đăng xuất</span>
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
