import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { EventItem, RoundItem, SubmissionItem, TeamInviteItem, TeamItem, TrackItem } from "../../api/types";
import { Wizard, type WizardStep } from "../../components/Wizard";
import { FeedbackThread } from "../../components/FeedbackThread";

export function MyTeamPage() {
  const { user, refreshPermissions } = useAuth();
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [invites, setInvites] = useState<TeamInviteItem[]>([]);
  const [openEvents, setOpenEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [teamsRes, invitesRes, eventsRes] = await Promise.all([
      api.get<TeamItem[]>("/api/me/teams"),
      api.get<TeamInviteItem[]>("/api/me/invites"),
      api.get<EventItem[]>("/api/events"),
    ]);
    setTeams(teamsRes.data);
    setInvites(invitesRes.data);
    setOpenEvents(eventsRes.data.filter((e) => e.status === "OPEN"));
  }

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
  }, []);

  async function acceptInvite(inviteId: string) {
    setError(null);
    setMessage(null);
    try {
      await api.post(`/api/invites/${inviteId}/accept`);
      await refreshPermissions();
      setMessage("Đã tham gia đội thi.");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Đội thi của tôi</h1>
          <p className="page-subtitle">Quản lý đội, mời thành viên, đăng ký Hạng mục và nộp bài</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {invites.length > 0 && (
        <div className="card">
          <div className="card-title">Lời mời tham gia đội</div>
          {invites.map((inv) => (
            <div className="flex between" key={inv.id} style={{ padding: "8px 0" }}>
              <span>
                Đội <strong>{inv.teamName}</strong> mời bạn tham gia
              </span>
              <button className="btn small" onClick={() => acceptInvite(inv.id)}>
                Chấp nhận
              </button>
            </div>
          ))}
        </div>
      )}

      {teams.length === 0 ? (
        <CreateTeamCard events={openEvents} onCreated={load} />
      ) : (
        teams.map((team) => (
          <TeamCard key={team.id} team={team} currentUserId={user?.userId} onChange={load} />
        ))
      )}
    </div>
  );
}

function CreateTeamCard({ events, onCreated }: { events: EventItem[]; onCreated: () => Promise<void> }) {
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId && events.length > 0) setEventId(events[0].id);
  }, [events, eventId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post(`/api/events/${eventId}/teams`, { name });
      await onCreated();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="card">
      <div className="card-title">Thành lập đội thi mới</div>
      {events.length === 0 ? (
        <div className="muted">Hiện không có sự kiện nào đang mở đăng ký.</div>
      ) : (
        <>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Sự kiện</label>
              <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Tên đội</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>
              Tạo đội
            </button>
          </form>
        </>
      )}
    </div>
  );
}

function TeamCard({
  team,
  currentUserId,
  onChange,
}: {
  team: TeamItem;
  currentUserId?: string;
  onChange: () => Promise<void>;
}) {
  const isLeader = team.members.some((m) => m.userId === currentUserId && m.roleInTeam === "LEADER");
  const [inviteEmail, setInviteEmail] = useState("");
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [trackId, setTrackId] = useState("");
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.get<TrackItem[]>(`/api/events/${team.eventId}/tracks`).then((res) => setTracks(res.data));
    if (team.trackId) {
      api.get<RoundItem[]>(`/api/events/${team.eventId}/rounds`).then((res) => setRounds(res.data));
    }
  }, [team.eventId, team.trackId]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await api.post(`/api/teams/${team.id}/invites`, { email: inviteEmail });
      setMessage(`Đã gửi lời mời tới ${inviteEmail}.`);
      setInviteEmail("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function registerTrack(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post(`/api/teams/${team.id}/register-track`, { trackId });
      await onChange();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="card">
      <div className="flex between">
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{team.name}</div>
          <div className="muted">
            {team.trackName ? `Hạng mục: ${team.trackName}` : "Chưa đăng ký Hạng mục"} • {team.members.length}/5 thành
            viên
          </div>
        </div>
        <span className={`badge ${team.status === "REGISTERED" ? "success" : "neutral"}`}>{team.status}</span>
      </div>

      {error && <div className="alert error section-gap">{error}</div>}
      {message && <div className="alert success section-gap">{message}</div>}

      <table className="section-gap">
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

      {isLeader && team.members.length < 5 && (
        <form onSubmit={invite} className="section-gap flex" style={{ flexDirection: "row" }}>
          <input
            type="email"
            placeholder="Email thành viên mời"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <button className="btn small" type="submit">
            Mời
          </button>
        </form>
      )}

      {isLeader && !team.trackId && team.members.length >= 3 && (
        <form onSubmit={registerTrack} className="section-gap flex">
          <select required value={trackId} onChange={(e) => setTrackId(e.target.value)} style={{ width: 240 }}>
            <option value="">Chọn Hạng mục</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button className="btn small" type="submit">
            Đăng ký Hạng mục
          </button>
        </form>
      )}

      {!team.trackId && team.members.length < 3 && (
        <div className="alert info section-gap">Đội cần tối thiểu 3 thành viên để đăng ký Hạng mục.</div>
      )}

      {team.trackId && (
        <div className="section-gap">
          <div className="card-title">Nộp bài theo vòng thi</div>
          {rounds.map((round) => (
            <SubmissionForm key={round.id} teamId={team.id} round={round} canEdit={isLeader} />
          ))}
        </div>
      )}

      <div className="section-gap">
        <div className="card-title">Trao đổi với Mentor</div>
        <FeedbackThread teamId={team.id} />
      </div>
    </div>
  );
}

function SubmissionForm({ teamId, round, canEdit }: { teamId: string; round: RoundItem; canEdit: boolean }) {
  const [existing, setExisting] = useState<SubmissionItem | null>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<SubmissionItem>(`/api/teams/${teamId}/rounds/${round.id}/submission`)
      .then((res) => {
        setExisting(res.data);
        setRepoUrl(res.data.repoUrl);
        setDemoUrl(res.data.demoUrl ?? "");
        setDocUrl(res.data.docUrl ?? "");
      })
      .catch(() => setExisting(null));
  }, [teamId, round.id]);

  async function submit() {
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      await api.put(`/api/teams/${teamId}/rounds/${round.id}/submission`, { repoUrl, demoUrl, docUrl });
      setMessage("Đã nộp bài thành công.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const deadlinePassed = new Date(round.submissionDeadline) < new Date();

  const steps: WizardStep[] = [
    {
      title: "Repository",
      validate: () => (repoUrl.trim() ? null : "Vui lòng nhập URL repository"),
      content: (
        <div className="form-row">
          <label>Repository URL</label>
          <input
            required
            type="url"
            placeholder="https://github.com/ten-doi/du-an"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        </div>
      ),
    },
    {
      title: "Demo",
      content: (
        <div className="form-row">
          <label>Demo URL (nếu có)</label>
          <input
            type="url"
            placeholder="https://ten-doi.vercel.app"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
          />
        </div>
      ),
    },
    {
      title: "Tài liệu",
      content: (
        <div className="form-row">
          <label>Slide/Báo cáo URL (nếu có)</label>
          <input
            type="url"
            placeholder="https://drive.google.com/..."
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="card" style={{ background: "var(--color-bg)" }}>
      <div className="flex between">
        <strong>
          #{round.orderIndex} {round.name}
        </strong>
        <span className="muted">Hạn: {new Date(round.submissionDeadline).toLocaleString("vi-VN")}</span>
      </div>
      {error && <div className="alert error section-gap">{error}</div>}
      {message && <div className="alert success section-gap">{message}</div>}
      {!canEdit ? (
        <div className="muted section-gap">
          {existing ? "Đội trưởng đã nộp bài cho vòng này." : "Chưa nộp bài. Chỉ đội trưởng có thể nộp bài."}
        </div>
      ) : deadlinePassed ? (
        <div className="muted section-gap">Đã quá hạn nộp bài.</div>
      ) : (
        <div className="section-gap">
          <Wizard
            steps={steps}
            onSubmit={submit}
            submitting={submitting}
            submitLabel={existing ? "Cập nhật bài nộp" : "Nộp bài"}
          />
        </div>
      )}
    </div>
  );
}
