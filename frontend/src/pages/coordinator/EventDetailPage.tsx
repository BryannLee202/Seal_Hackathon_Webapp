import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import type { EventItem } from "../../api/types";
import { TracksTab } from "./TracksTab";
import { RoundsTab } from "./RoundsTab";
import { PrizesTab } from "./PrizesTab";
import { CalibrationTab } from "./CalibrationTab";
import { DisqualificationsTab } from "./DisqualificationsTab";

type Tab = "tracks" | "rounds" | "prizes" | "calibration" | "disqualifications";

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [tab, setTab] = useState<Tab>("rounds");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    api
      .get<EventItem>(`/api/events/${eventId}`)
      .then((res) => setEvent(res.data))
      .catch((err) => setError((err as Error).message));
  }, [eventId]);

  if (!eventId) return null;

  return (
    <div>
      <div className="topbar">
        <div>
          <Link to="/coordinator/events" className="muted" style={{ fontSize: 13 }}>
            ← Danh sách sự kiện
          </Link>
          <h1 className="page-title">{event?.name ?? "Đang tải..."}</h1>
          <p className="page-subtitle">{event?.description}</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="tabs">
        <button className={`tab${tab === "tracks" ? " active" : ""}`} onClick={() => setTab("tracks")}>
          Hạng mục
        </button>
        <button className={`tab${tab === "rounds" ? " active" : ""}`} onClick={() => setTab("rounds")}>
          Vòng thi
        </button>
        <button className={`tab${tab === "prizes" ? " active" : ""}`} onClick={() => setTab("prizes")}>
          Giải thưởng
        </button>
        {event?.rblEnabled && (
          <button className={`tab${tab === "calibration" ? " active" : ""}`} onClick={() => setTab("calibration")}>
            Vòng hiệu chuẩn (RBL)
          </button>
        )}
        <button
          className={`tab${tab === "disqualifications" ? " active" : ""}`}
          onClick={() => setTab("disqualifications")}
        >
          Loại đội/bài nộp
        </button>
      </div>

      {tab === "tracks" && <TracksTab eventId={eventId} />}
      {tab === "rounds" && event && <RoundsTab eventId={eventId} rblEnabled={event.rblEnabled} />}
      {tab === "prizes" && <PrizesTab eventId={eventId} />}
      {tab === "calibration" && event?.rblEnabled && <CalibrationTab eventId={eventId} />}
      {tab === "disqualifications" && <DisqualificationsTab eventId={eventId} />}
    </div>
  );
}
