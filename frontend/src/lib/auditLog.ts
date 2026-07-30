import type { AuditAction } from "../api/types";

export const ACTION_LABEL: Record<AuditAction, string> = {
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

export const ACTION_TONE: Record<AuditAction, "success" | "danger" | "warning" | "info" | "primary"> = {
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

export const ENTITY_LABEL: Record<string, string> = {
  User: "Tài khoản",
  Team: "Đội thi",
  Submission: "Bài nộp",
  Score: "Điểm số",
  Round: "Vòng thi",
  Prize: "Giải thưởng",
};
