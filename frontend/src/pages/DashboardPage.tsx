import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { api } from "../api/client";
import type { AuditLogItem, EventItem, Page, RoleName, UserSummary } from "../api/types";
import { IconArrowRight, IconCalendar, IconGavel, IconShieldCheck, IconUsers } from "../components/icons";
import { toast } from "../lib/toast";
import { ACTION_LABEL } from "../lib/auditLog";

export function DashboardPage() {
  const { user, hasRole, refreshPermissions } = useAuth();

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Xin chào, {user?.fullName}</h1>
          <p className="page-subtitle">
            {hasRole("COORDINATOR") ? "Tổng quan Ban tổ chức" : "Đây là vai trò hiện tại của bạn trong hệ thống"}
          </p>
        </div>
        <button className="btn secondary small" onClick={refreshPermissions}>
          Làm mới quyền truy cập
        </button>
      </div>

      {hasRole("COORDINATOR") ? (
        <CoordinatorOverview />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

interface PriorityItem {
  key: string;
  tone: "warning" | "danger" | "info";
  text: string;
  to: string;
}

function CoordinatorOverview() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[] | null>(null);

  useEffect(() => {
    api
      .get<Page<UserSummary>>("/api/admin/users/pending")
      .then((res) => setPendingCount(res.data.totalElements))
      .catch((err) => toast.error((err as Error).message));
    api
      .get<EventItem[]>("/api/events")
      .then((res) => setEvents(res.data))
      .catch((err) => toast.error((err as Error).message));
    api
      .get<Page<AuditLogItem>>("/api/admin/audit-logs/recent", { params: { page: 0, size: 5 } })
      .then((res) => setRecentLogs(res.data.content))
      .catch((err) => toast.error((err as Error).message));
  }, []);

  const priorityItems: PriorityItem[] = [];
  if (pendingCount) {
    priorityItems.push({
      key: "pending-users",
      tone: "warning",
      text: `${pendingCount} tài khoản đang chờ phê duyệt`,
      to: "/coordinator/users",
    });
  }
  if (events) {
    const now = Date.now();
    for (const ev of events) {
      if (ev.status !== "OPEN" || !ev.endDate) continue;
      const daysLeft = Math.ceil((new Date(ev.endDate).getTime() - now) / 86_400_000);
      if (daysLeft >= 0 && daysLeft <= 3) {
        priorityItems.push({
          key: `event-closing-${ev.id}`,
          tone: daysLeft <= 1 ? "danger" : "warning",
          text: `Đăng ký "${ev.name}" đóng trong ${daysLeft === 0 ? "hôm nay" : `${daysLeft} ngày`}`,
          to: `/coordinator/events/${ev.id}`,
        });
      }
    }
  }

  const metrics =
    events && pendingCount !== null
      ? [
          { label: "Sự kiện", value: events.length },
          { label: "Đang mở đăng ký", value: events.filter((e) => e.status === "OPEN").length },
          { label: "Đang diễn ra", value: events.filter((e) => e.status === "ONGOING").length },
          { label: "Chờ phê duyệt", value: pendingCount },
        ]
      : null;

  const loading = pendingCount === null || events === null;

  return (
    <>
      <div className="dashboard-section-label">Cần chú ý</div>
      {loading ? (
        <div className="dashboard-priority-empty">Đang tải...</div>
      ) : priorityItems.length === 0 ? (
        <div className="dashboard-priority-empty">Không có việc gì cần xử lý gấp. Mọi thứ đang ổn.</div>
      ) : (
        <div className="dashboard-priority">
          {priorityItems.map((item) => (
            <Link key={item.key} to={item.to} className="dashboard-priority-item">
              <span className={`dashboard-priority-dot ${item.tone}`} />
              <span className="dashboard-priority-text">{item.text}</span>
              <IconArrowRight width={14} height={14} />
            </Link>
          ))}
        </div>
      )}

      <div className="dashboard-section-label">Tổng quan</div>
      {metrics && (
        <div className="dashboard-metrics">
          {metrics.map((m) => (
            <div className="dashboard-metric" key={m.label}>
              <div className="dashboard-metric-value">{m.value}</div>
              <div className="dashboard-metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-section-label">Hoạt động gần đây</div>
      <div className="card">
        {!recentLogs ? (
          <div className="muted">Đang tải...</div>
        ) : recentLogs.length === 0 ? (
          <div className="muted">Chưa có hoạt động nào.</div>
        ) : (
          <>
            {recentLogs.map((log) => (
              <div className="dashboard-activity-item" key={log.id}>
                <span>
                  {ACTION_LABEL[log.action] ?? log.action} · <span className="muted">{log.actorName}</span>
                </span>
                <time>
                  {new Date(log.timestamp).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                </time>
              </div>
            ))}
            <Link className="dashboard-activity-more" to="/coordinator/audit-log">
              Xem toàn bộ nhật ký →
            </Link>
          </>
        )}
      </div>
    </>
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
