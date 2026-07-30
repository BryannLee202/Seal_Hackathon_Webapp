import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { api } from "../api/client";
import type {
  AuditLogItem,
  CalibrationRoundItem,
  CriterionItem,
  EventItem,
  FeedbackMessageItem,
  Page,
  RoleName,
  RoundItem,
  ScoreItem,
  SubmissionItem,
  TeamInviteItem,
  TeamItem,
  UserSummary,
} from "../api/types";
import { IconArrowRight, IconCalendar, IconGavel, IconShieldCheck, IconUsers } from "../components/icons";
import { toast } from "../lib/toast";
import { ACTION_LABEL } from "../lib/auditLog";

export function DashboardPage() {
  const { user, hasRole, refreshPermissions } = useAuth();

  const isCoordinator = hasRole("COORDINATOR");
  const isJudge = hasRole("JUDGE");
  const isMentor = hasRole("MENTOR");
  const isTeam = hasRole("TEAM_MEMBER") || hasRole("TEAM_LEADER");

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Xin chào, {user?.fullName}</h1>
          <p className="page-subtitle">
            {isCoordinator
              ? "Tổng quan Ban tổ chức"
              : isJudge
                ? "Tổng quan chấm điểm"
                : isMentor
                  ? "Tổng quan Mentor"
                  : isTeam
                    ? "Tổng quan đội thi"
                    : "Đây là vai trò hiện tại của bạn trong hệ thống"}
          </p>
        </div>
        <button className="btn secondary small" onClick={refreshPermissions}>
          Làm mới quyền truy cập
        </button>
      </div>

      {isCoordinator ? (
        <CoordinatorOverview />
      ) : isJudge ? (
        <JudgeOverview />
      ) : isMentor ? (
        <MentorOverview />
      ) : isTeam ? (
        <TeamOverview />
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

interface JudgeSummary {
  pendingCount: number;
  doneCount: number;
  calibrationCount: number;
  recent: { submissionId: string; teamName: string; scoredAt: string }[];
}

function JudgeOverview() {
  const { user } = useAuth();
  const roundIds = (user?.roles ?? [])
    .filter((r) => r.roleName === "JUDGE" && r.scopeType === "ROUND" && r.scopeId)
    .map((r) => r.scopeId as string);

  const [summary, setSummary] = useState<JudgeSummary | null>(null);

  useEffect(() => {
    if (roundIds.length === 0) {
      setSummary({ pendingCount: 0, doneCount: 0, calibrationCount: 0, recent: [] });
      return;
    }
    (async () => {
      const roundInfos = await Promise.all(roundIds.map((id) => api.get<RoundItem>(`/api/rounds/${id}`)));
      const eventIds = Array.from(new Set(roundInfos.map((r) => r.data.eventId)));

      const roundData = await Promise.all(
        roundIds.map(async (id) => {
          const [criteria, submissions] = await Promise.all([
            api.get<CriterionItem[]>(`/api/rounds/${id}/criteria`),
            api.get<Page<SubmissionItem>>(`/api/rounds/${id}/submissions`),
          ]);
          return { criteria: criteria.data, submissions: submissions.data.content };
        }),
      );

      const scored = await Promise.all(
        roundData.flatMap((rd) =>
          rd.submissions.map(async (s) => {
            const scores = await api.get<ScoreItem[]>(`/api/submissions/${s.id}/scores`);
            const finalizedCount = scores.data.filter((sc) => sc.finalized).length;
            const done = rd.criteria.length > 0 && finalizedCount === rd.criteria.length;
            const lastScoredAt = scores.data.reduce<string | null>(
              (max, sc) => (sc.scoredAt && (!max || sc.scoredAt > max) ? sc.scoredAt : max),
              null,
            );
            return { teamName: s.teamName, submissionId: s.id, done, lastScoredAt };
          }),
        ),
      );

      let calibrationCount = 0;
      for (const eventId of eventIds) {
        const res = await api.get<CalibrationRoundItem[]>(`/api/events/${eventId}/calibration-rounds`);
        calibrationCount += res.data.filter((cr) => cr.active).length;
      }

      const recent = scored
        .filter((s): s is typeof s & { lastScoredAt: string } => !!s.lastScoredAt)
        .sort((a, b) => (a.lastScoredAt < b.lastScoredAt ? 1 : -1))
        .slice(0, 5)
        .map((s) => ({ submissionId: s.submissionId, teamName: s.teamName, scoredAt: s.lastScoredAt }));

      setSummary({
        pendingCount: scored.filter((s) => !s.done).length,
        doneCount: scored.filter((s) => s.done).length,
        calibrationCount,
        recent,
      });
    })().catch((err) => toast.error((err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIds.join(",")]);

  const priorityItems: PriorityItem[] = [];
  if (summary) {
    if (roundIds.length === 0) {
      priorityItems.push({
        key: "no-rounds",
        tone: "info",
        text: "Chưa được phân công vòng thi nào",
        to: "/judge",
      });
    }
    if (summary.pendingCount > 0) {
      priorityItems.push({
        key: "pending-scores",
        tone: "warning",
        text: `${summary.pendingCount} bài nộp chưa chấm xong`,
        to: "/judge",
      });
    }
    if (summary.calibrationCount > 0) {
      priorityItems.push({
        key: "calibration",
        tone: "info",
        text: `${summary.calibrationCount} vòng hiệu chuẩn (RBL) đang mở, cần chấm bài mẫu`,
        to: "/judge",
      });
    }
  }

  const metrics = summary
    ? [
        { label: "Vòng được phân công", value: roundIds.length },
        { label: "Đã chấm xong", value: summary.doneCount },
        { label: "Chưa chấm", value: summary.pendingCount },
        { label: "Hiệu chuẩn đang mở", value: summary.calibrationCount },
      ]
    : null;

  return (
    <>
      <div className="dashboard-section-label">Cần chú ý</div>
      {!summary ? (
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
        {!summary ? (
          <div className="muted">Đang tải...</div>
        ) : summary.recent.length === 0 ? (
          <div className="muted">Chưa có hoạt động nào.</div>
        ) : (
          <>
            {summary.recent.map((r) => (
              <div className="dashboard-activity-item" key={r.submissionId}>
                <span>
                  Đã chấm cho đội <span className="muted">{r.teamName}</span>
                </span>
                <time>
                  {new Date(r.scoredAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                </time>
              </div>
            ))}
            <Link className="dashboard-activity-more" to="/judge">
              Đi tới trang chấm điểm →
            </Link>
          </>
        )}
      </div>
    </>
  );
}

interface TeamSummary {
  team: TeamItem | null;
  invites: TeamInviteItem[];
  rounds: { round: RoundItem; submitted: boolean }[];
  recent: FeedbackMessageItem[];
}

function TeamOverview() {
  const [summary, setSummary] = useState<TeamSummary | null>(null);

  useEffect(() => {
    (async () => {
      const [teamsRes, invitesRes] = await Promise.all([
        api.get<TeamItem[]>("/api/me/teams"),
        api.get<TeamInviteItem[]>("/api/me/invites"),
      ]);
      const team = teamsRes.data[0] ?? null;

      let rounds: { round: RoundItem; submitted: boolean }[] = [];
      let recent: FeedbackMessageItem[] = [];
      if (team) {
        if (team.trackId) {
          const roundsRes = await api.get<RoundItem[]>(`/api/events/${team.eventId}/rounds`);
          rounds = await Promise.all(
            roundsRes.data.map(async (round) => {
              let submitted = true;
              try {
                await api.get(`/api/teams/${team.id}/rounds/${round.id}/submission`);
              } catch {
                submitted = false;
              }
              return { round, submitted };
            }),
          );
        }
        const msgsRes = await api.get<FeedbackMessageItem[]>(`/api/teams/${team.id}/messages`);
        recent = msgsRes.data.slice(-5).reverse();
      }

      setSummary({ team, invites: invitesRes.data, rounds, recent });
    })().catch((err) => toast.error((err as Error).message));
  }, []);

  const priorityItems: PriorityItem[] = [];
  if (summary) {
    if (summary.invites.length > 0) {
      priorityItems.push({
        key: "invites",
        tone: "info",
        text: `${summary.invites.length} lời mời tham gia đội đang chờ`,
        to: "/my-team",
      });
    }
    if (!summary.team) {
      priorityItems.push({ key: "no-team", tone: "warning", text: "Bạn chưa có đội thi nào", to: "/my-team" });
    } else {
      const now = Date.now();
      for (const { round, submitted } of summary.rounds) {
        if (submitted) continue;
        const daysLeft = Math.ceil((new Date(round.submissionDeadline).getTime() - now) / 86_400_000);
        if (daysLeft >= 0 && daysLeft <= 3) {
          priorityItems.push({
            key: `submit-${round.id}`,
            tone: daysLeft <= 1 ? "danger" : "warning",
            text: `Chưa nộp bài vòng "${round.name}", hạn còn ${daysLeft === 0 ? "hôm nay" : `${daysLeft} ngày`}`,
            to: "/my-team",
          });
        }
      }
    }
  }

  const metrics =
    summary && summary.team
      ? [
          { label: "Thành viên", value: `${summary.team.members.length}/5` },
          { label: "Vòng đã nộp", value: summary.rounds.filter((r) => r.submitted).length },
          { label: "Vòng chưa nộp", value: summary.rounds.filter((r) => !r.submitted).length },
          { label: "Lời mời đang chờ", value: summary.invites.length },
        ]
      : null;

  return (
    <>
      <div className="dashboard-section-label">Cần chú ý</div>
      {!summary ? (
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
      {metrics ? (
        <div className="dashboard-metrics">
          {metrics.map((m) => (
            <div className="dashboard-metric" key={m.label}>
              <div className="dashboard-metric-value">{m.value}</div>
              <div className="dashboard-metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      ) : summary ? (
        <div className="dashboard-priority-empty">Chưa có đội thi để hiển thị.</div>
      ) : null}

      <div className="dashboard-section-label">Hoạt động gần đây</div>
      <div className="card">
        {!summary ? (
          <div className="muted">Đang tải...</div>
        ) : !summary.team || summary.recent.length === 0 ? (
          <div className="muted">Chưa có hoạt động nào.</div>
        ) : (
          <>
            {summary.recent.map((m) => (
              <div className="dashboard-activity-item" key={m.id}>
                <span>
                  {m.authorRole === "MENTOR" ? "Mentor" : "Đội của bạn"} ·{" "}
                  <span className="muted">{m.body.length > 60 ? `${m.body.slice(0, 60)}…` : m.body}</span>
                </span>
                <time>{new Date(m.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</time>
              </div>
            ))}
            <Link className="dashboard-activity-more" to="/my-team">
              Xem toàn bộ trao đổi →
            </Link>
          </>
        )}
      </div>
    </>
  );
}

interface MentorSummary {
  teams: TeamItem[];
  threads: { team: TeamItem; messages: FeedbackMessageItem[] }[];
}

function MentorOverview() {
  const [summary, setSummary] = useState<MentorSummary | null>(null);

  useEffect(() => {
    (async () => {
      const teamsRes = await api.get<TeamItem[]>("/api/mentor/teams");
      const teams = teamsRes.data;
      const threads = await Promise.all(
        teams.map(async (team) => {
          const res = await api.get<FeedbackMessageItem[]>(`/api/teams/${team.id}/messages`);
          return { team, messages: res.data };
        }),
      );
      setSummary({ teams, threads });
    })().catch((err) => toast.error((err as Error).message));
  }, []);

  const priorityItems: PriorityItem[] = [];
  if (summary) {
    if (summary.teams.length === 0) {
      priorityItems.push({
        key: "no-teams",
        tone: "info",
        text: "Chưa được phân công Hạng mục nào",
        to: "/mentor",
      });
    }
    for (const { team, messages } of summary.threads) {
      const last = messages[messages.length - 1];
      if (last && last.authorRole === "TEAM_MEMBER") {
        priorityItems.push({
          key: `awaiting-${team.id}`,
          tone: "warning",
          text: `Đội "${team.name}" đang chờ phản hồi của bạn`,
          to: "/mentor",
        });
      }
    }
  }

  const metrics = summary
    ? [
        { label: "Đội được phân công", value: summary.teams.length },
        {
          label: "Cần phản hồi",
          value: summary.threads.filter((t) => {
            const last = t.messages[t.messages.length - 1];
            return last && last.authorRole === "TEAM_MEMBER";
          }).length,
        },
        { label: "Tổng thành viên", value: summary.teams.reduce((sum, t) => sum + t.members.length, 0) },
        { label: "Tổng trao đổi", value: summary.threads.reduce((sum, t) => sum + t.messages.length, 0) },
      ]
    : null;

  const recent = summary
    ? summary.threads
        .flatMap((t) => t.messages.map((m) => ({ ...m, teamName: t.team.name })))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 5)
    : [];

  return (
    <>
      <div className="dashboard-section-label">Cần chú ý</div>
      {!summary ? (
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
        {!summary ? (
          <div className="muted">Đang tải...</div>
        ) : recent.length === 0 ? (
          <div className="muted">Chưa có hoạt động nào.</div>
        ) : (
          <>
            {recent.map((m) => (
              <div className="dashboard-activity-item" key={m.id}>
                <span>
                  {m.authorRole === "MENTOR" ? "Bạn" : `Đội ${m.teamName}`} ·{" "}
                  <span className="muted">{m.body.length > 60 ? `${m.body.slice(0, 60)}…` : m.body}</span>
                </span>
                <time>{new Date(m.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</time>
              </div>
            ))}
            <Link className="dashboard-activity-more" to="/mentor">
              Xem tất cả đội được phân công →
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
