import { useState } from "react";
import { api } from "../../api/client";
import type { AuditAction, AuditLogItem, Page } from "../../api/types";
import { EmptyState } from "../../components/EmptyState";

const ACTION_LABEL: Record<AuditAction, string> = {
  ACCOUNT_REGISTER: "Đăng ký tài khoản",
  ACCOUNT_APPROVE: "Duyệt tài khoản",
  ACCOUNT_REJECT: "Từ chối tài khoản",
  GUEST_JUDGE_CREATE: "Tạo giám khảo khách mời",
  SCORE_CREATE: "Chấm điểm",
  SCORE_UPDATE: "Sửa điểm",
  SCORE_FINALIZE: "Chốt điểm",
  TEAM_DISQUALIFY: "Loại đội thi",
  SUBMISSION_DISQUALIFY: "Loại bài nộp",
  JUDGE_ASSIGN: "Phân công giám khảo",
  MENTOR_ASSIGN: "Phân công mentor",
  RANKING_COMPUTE: "Tính lại xếp hạng",
  PROMOTION_COMPUTE: "Tính thăng vòng",
  PRIZE_AWARD: "Trao giải",
  RESULT_PUBLISH: "Công bố kết quả",
  MENTOR_MESSAGE_SEND: "Gửi phản hồi Mentor",
  VOTE_CAST: "Bình chọn khán giả",
};

const ACTION_TONE: Record<AuditAction, "success" | "danger" | "warning" | "info" | "primary"> = {
  ACCOUNT_REGISTER: "info",
  ACCOUNT_APPROVE: "success",
  ACCOUNT_REJECT: "danger",
  GUEST_JUDGE_CREATE: "info",
  SCORE_CREATE: "primary",
  SCORE_UPDATE: "warning",
  SCORE_FINALIZE: "success",
  TEAM_DISQUALIFY: "danger",
  SUBMISSION_DISQUALIFY: "danger",
  JUDGE_ASSIGN: "info",
  MENTOR_ASSIGN: "info",
  RANKING_COMPUTE: "primary",
  PROMOTION_COMPUTE: "primary",
  PRIZE_AWARD: "success",
  RESULT_PUBLISH: "success",
  MENTOR_MESSAGE_SEND: "info",
  VOTE_CAST: "primary",
};

const ENTITY_LABEL: Record<string, string> = {
  User: "Tài khoản",
  Team: "Đội thi",
  Submission: "Bài nộp",
  Score: "Điểm số",
  Round: "Vòng thi",
  Prize: "Giải thưởng",
};

const PAGE_SIZE = 30;

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function loadPage(pageToLoad: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Page<AuditLogItem>>("/api/admin/audit-logs/recent", {
        params: { page: pageToLoad, size: PAGE_SIZE },
      });
      setLogs((prev) => (pageToLoad === 0 ? res.data.content : [...prev, ...res.data.content]));
      setTotalPages(res.data.totalPages);
      setPage(pageToLoad);
      setLoaded(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!loaded && !loading && !error) {
    loadPage(0);
  }

  const hasMore = totalPages !== null && page + 1 < totalPages;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Nhật ký kiểm tra</h1>
          <p className="page-subtitle">Toàn bộ hành động chấm điểm, phê duyệt, loại đội: minh bạch, không thể sửa</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loaded && logs.length === 0 ? (
        <div className="card">
          <EmptyState title="Chưa có hoạt động nào" description="Nhật ký sẽ xuất hiện khi có hành động nghiệp vụ diễn ra." />
        </div>
      ) : (
        <div className="card">
          <div className="audit-timeline">
            {logs.map((log) => (
              <AuditTimelineItem key={log.id} log={log} />
            ))}
          </div>

          {loading && <div className="muted" style={{ textAlign: "center", padding: "16px 0" }}>Đang tải...</div>}

          {hasMore && !loading && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button className="btn secondary small" onClick={() => loadPage(page + 1)}>
                Xem thêm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AuditTimelineItem({ log }: { log: AuditLogItem }) {
  const tone = ACTION_TONE[log.action] ?? "neutral";
  const entityLabel = ENTITY_LABEL[log.entityType] ?? log.entityType;

  return (
    <div className="audit-timeline-item">
      <div className={`audit-timeline-dot badge-dot-${tone}`} />
      <div className="audit-timeline-body">
        <div className="flex between wrap" style={{ gap: 8 }}>
          <div>
            <span className={`badge ${tone}`}>{ACTION_LABEL[log.action] ?? log.action}</span>{" "}
            <span style={{ fontWeight: 700 }}>{entityLabel}</span>
            {log.entityId && <span className="muted"> · #{log.entityId.slice(0, 8)}</span>}
          </div>
          <span className="muted" style={{ fontSize: 12 }}>
            {new Date(log.timestamp).toLocaleString("vi-VN")}
          </span>
        </div>
        <div className="muted" style={{ fontSize: 12.8, marginTop: 4 }}>
          Thực hiện bởi <strong>{log.actorName}</strong>
        </div>
        {(log.oldValueJson || log.newValueJson) && (
          <details className="audit-timeline-details">
            <summary>Xem chi tiết thay đổi</summary>
            <div className="grid grid-2" style={{ marginTop: 8 }}>
              {log.oldValueJson && (
                <div>
                  <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    TRƯỚC
                  </div>
                  <code style={{ display: "block", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {formatJson(log.oldValueJson)}
                  </code>
                </div>
              )}
              {log.newValueJson && (
                <div>
                  <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    SAU
                  </div>
                  <code style={{ display: "block", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {formatJson(log.newValueJson)}
                  </code>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

function formatJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
