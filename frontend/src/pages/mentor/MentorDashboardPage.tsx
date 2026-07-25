import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { TeamItem } from "../../api/types";
import { EmptyState } from "../../components/EmptyState";
import { FeedbackThread } from "../../components/FeedbackThread";

export function MentorDashboardPage() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<TeamItem[]>("/api/mentor/teams")
      .then((res) => setTeams(res.data))
      .catch((err) => setError((err as Error).message));
  }, []);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Đội được phân công</h1>
          <p className="page-subtitle">Các đội thi thuộc Hạng mục bạn đang làm Mentor</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {teams.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Chưa được phân công Hạng mục nào"
            description="Khi Ban tổ chức phân công bạn làm Mentor cho một Hạng mục, các đội thi sẽ hiện ở đây."
          />
        </div>
      ) : (
        teams.map((team) => (
          <div className="card" key={team.id}>
            <div
              className="flex between"
              style={{ cursor: "pointer" }}
              onClick={() => setExpandedId((id) => (id === team.id ? null : team.id))}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{team.name}</div>
                <div className="muted">
                  Hạng mục: {team.trackName} • {team.members.length}/5 thành viên
                </div>
              </div>
              <span className="muted">{expandedId === team.id ? "Thu gọn ▲" : "Xem chi tiết ▼"}</span>
            </div>

            {expandedId === team.id && (
              <div className="section-gap">
                <table>
                  <thead>
                    <tr>
                      <th>Thành viên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.members.map((m) => (
                      <tr key={m.userId}>
                        <td>{m.fullName}</td>
                        <td>{m.email}</td>
                        <td>{m.roleInTeam === "LEADER" ? "Đội trưởng" : "Thành viên"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="section-gap">
                  <div className="card-title">Trao đổi & phản hồi</div>
                  <FeedbackThread teamId={team.id} />
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
