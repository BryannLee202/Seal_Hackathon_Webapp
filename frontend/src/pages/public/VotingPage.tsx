import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { EventItem, TrackItem, VoteTallyItem } from "../../api/types";
import { IconHeart, IconSparkles } from "../../components/icons";
import { TiltCard } from "../../components/TiltCard";
import { CountUp } from "../../components/CountUp";
import { EmptyState } from "../../components/EmptyState";
import { BrandMark } from "../../components/BrandMark";
import { toast } from "../../lib/toast";

const POLL_INTERVAL_MS = 15000;

function votedKey(trackId: string) {
  return `seal_voted_${trackId}`;
}

export function VotingPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [trackId, setTrackId] = useState("");
  const [tallies, setTallies] = useState<VoteTallyItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<EventItem[]>("/api/public/voting/events")
      .then((res) => {
        setEvents(res.data);
        if (res.data.length > 0) setEventId(res.data[0].id);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!eventId) return;
    api.get<TrackItem[]>(`/api/public/voting/events/${eventId}/tracks`).then((res) => {
      setTracks(res.data);
      if (res.data.length > 0) setTrackId(res.data[0].id);
    });
  }, [eventId]);

  useEffect(() => {
    if (!trackId) return;

    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<VoteTallyItem[]>(`/api/public/voting/tracks/${trackId}/tallies`);
        if (!cancelled) setTallies(res.data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [trackId]);

  const [votedTeamId, setVotedTeamId] = useState<string | null>(null);
  useEffect(() => {
    if (!trackId) return;
    setVotedTeamId(localStorage.getItem(votedKey(trackId)));
  }, [trackId]);

  async function castVote(teamId: string, teamName: string) {
    try {
      const res = await api.post<{ teamId: string; teamVoteCount: number }>(
        `/api/public/voting/tracks/${trackId}/votes`,
        { teamId },
      );
      localStorage.setItem(votedKey(trackId), teamId);
      setVotedTeamId(teamId);
      setTallies((prev) =>
        prev.map((t) => (t.teamId === teamId ? { ...t, voteCount: res.data.teamVoteCount } : t)),
      );
      toast.success(`Đã bình chọn cho "${teamName}"!`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="landing">
      <header className="l-nav">
        <div className="l-container l-nav-inner">
          <Link className="l-nav-brand" to="/">
            <div className="l-nav-mark">
              <BrandMark size={18} />
            </div>
            SEAL Hackathon
          </Link>
          <div className="l-nav-actions">
            <Link className="l-btn-ghost small" to="/">
              Về trang chủ
            </Link>
          </div>
        </div>
      </header>

      <section className="l-hero" style={{ padding: "64px 0 40px" }}>
        <div className="l-hero-glow" />
        <div className="l-container l-page-hero-inner">
          <div className="l-badge">
            <IconSparkles width={14} height={14} />
            Bình chọn khán giả
          </div>
          <h1 className="l-hero-title">
            <span className="l-gradient-text">Giải được yêu thích</span> do khán giả bình chọn
          </h1>
          <p className="l-hero-subtitle">
            Theo dõi các đội thi và bình chọn cho đội bạn yêu thích nhất ở mỗi Hạng mục. Mỗi người chỉ được bình
            chọn 1 lần cho mỗi Hạng mục.
          </p>
        </div>
      </section>

      <section className="l-section" style={{ paddingTop: 0 }}>
        <div className="l-container">
          {error && (
            <div className="l-badge" style={{ borderColor: "var(--color-danger)", color: "#ff8a8a" }}>
              {error}
            </div>
          )}

          {events.length > 1 && (
            <div className="l-vote-tabs">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  className={`l-btn-ghost small l-vote-tab ${ev.id === eventId ? "active" : ""}`}
                  onClick={() => setEventId(ev.id)}
                >
                  {ev.name}
                </button>
              ))}
            </div>
          )}

          {tracks.length > 0 && (
            <div className="l-vote-tabs">
              {tracks.map((t) => (
                <button
                  key={t.id}
                  className={`l-btn-ghost small l-vote-tab ${t.id === trackId ? "active" : ""}`}
                  onClick={() => setTrackId(t.id)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}

          {!loading && tallies.length === 0 && (
            <EmptyState
              title="Chưa có đội thi nào để bình chọn"
              description="Hạng mục này hiện chưa có đội thi hoặc chưa mở bình chọn."
            />
          )}

          <div className="l-feature-grid">
            {tallies.map((t) => (
              <TiltCard className="l-track-card" key={t.teamId}>
                <h3>{t.teamName}</h3>
                <div className="l-vote-count-label">Lượt bình chọn</div>
                <div className="l-vote-count">
                  <CountUp target={t.voteCount} duration={0.8} />
                </div>
                {votedTeamId === t.teamId ? (
                  <div className="l-vote-voted-badge">
                    <IconHeart width={16} height={16} />
                    Bạn đã bình chọn đội này
                  </div>
                ) : (
                  <button
                    className="l-btn-primary small"
                    style={{ marginTop: 16 }}
                    disabled={!!votedTeamId}
                    onClick={() => castVote(t.teamId, t.teamName)}
                  >
                    <IconHeart width={15} height={15} />
                    Bình chọn
                  </button>
                )}
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <footer className="l-footer">
        <div className="l-container l-footer-inner">
          <div className="l-footer-brand">
            <div className="l-footer-mark">
              <BrandMark size={18} />
            </div>
            SEAL Hackathon
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            © 2026 SEAL Hackathon Management System.
          </div>
        </div>
      </footer>
    </div>
  );
}
