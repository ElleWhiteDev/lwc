import { useState, useEffect } from "react";
import { useSiteConfig } from "../config/siteConfig.jsx";
import Modal from "../components/Modal";
import { useModal } from "../hooks/useModal";
import "./Events.css";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

/** Returns the first available image URL for an event. */
function getEventImage(event) {
  return event.images?.length > 0 ? event.images[0].image_url : event.image_url;
}

/** Formats a date string for display, handling invalid/missing values. */
function formatDate(dateString) {
  if (!dateString) return "Date TBA";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "Date TBA"
    : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Returns a Google Maps search URL for a given address. */
function googleMapsUrl(location) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

/** Generates and downloads an .ics calendar invite for an event. */
function downloadICS(event) {
  if (!event.date) return;
  const pad = (n) => String(n).padStart(2, "0");

  const dateMatch = event.date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const base = dateMatch
    ? new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]))
    : new Date(event.date);
  if (isNaN(base.getTime())) return;

  let dtstart, dtend;
  const timeMatch = event.time?.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (timeMatch) {
    let h = parseInt(timeMatch[1]);
    const min = parseInt(timeMatch[2]);
    const period = timeMatch[3]?.toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    const start = new Date(base);
    start.setHours(h, min, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = (d) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    dtstart = fmt(start);
    dtend = fmt(end);
  } else {
    dtstart = `${base.getFullYear()}${pad(base.getMonth() + 1)}${pad(base.getDate())}`;
    const next = new Date(base.getTime() + 86400000);
    dtend = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
  }

  const isAllDay = dtstart.length === 8;
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LWC Events//EN",
    "BEGIN:VEVENT",
    isAllDay ? `DTSTART;VALUE=DATE:${dtstart}` : `DTSTART:${dtstart}`,
    isAllDay ? `DTEND;VALUE=DATE:${dtend}` : `DTEND:${dtend}`,
    `SUMMARY:${esc(event.title || "Event")}`,
    event.description ? `DESCRIPTION:${esc(event.description).replace(/\n/g, "\\n")}` : null,
    event.location ? `LOCATION:${esc(event.location)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(event.title || "event").replace(/[^a-z0-9]/gi, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Shared click/keyboard props for interactive event cards. */
function cardProps(event, onOpen) {
  return {
    onClick: () => onOpen(event),
    onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(event); } },
    tabIndex: 0,
    role: "button",
    "aria-label": `View details for ${event.title}`,
  };
}

const Events = () => {
  const siteConfig = useSiteConfig();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const eventModal = useModal();

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then((data) => { if (data.events) setEvents(data.events); })
      .catch((err) => console.error("Error loading events:", err))
      .finally(() => setLoading(false));
  }, []);

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setCurrentImageIndex(0);
    eventModal.open();
  };

  const closeEventModal = () => {
    eventModal.close();
    setTimeout(() => { setSelectedEvent(null); setCurrentImageIndex(0); }, 300);
  };

  const prevImage = () => setCurrentImageIndex((i) =>
    i === 0 ? selectedEvent.images.length - 1 : i - 1
  );
  const nextImage = () => setCurrentImageIndex((i) =>
    i === selectedEvent.images.length - 1 ? 0 : i + 1
  );

  const now = new Date();
  const isUpcoming = (event) => {
    if (!event.date) return true;
    const d = new Date(event.date);
    return isNaN(d.getTime()) || d >= now;
  };
  const upcomingEvents = events.filter(isUpcoming);
  const pastEvents = events.filter((e) => !isUpcoming(e));

  return (
    <div className="events">
      {/* Hero */}
      <section
        className="events-hero"
        style={{ backgroundImage: `url(${LWCHomeBackground})` }}
        aria-labelledby="events-title"
      >
        <div className="container">
          <h1 id="events-title">Events &amp; Activities</h1>
          <p className="events-hero-subtitle">
            Join us at our upcoming events and be part of our vibrant community!
          </p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="upcoming-events section" aria-labelledby="upcoming-events-heading">
        <div className="container">
          <h2 id="upcoming-events-heading" className="section-title">Upcoming Events</h2>
          <div className="upcoming-events-list">
            {loading ? (
              <p role="status" aria-live="polite">Loading events...</p>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                const featuredImage = getEventImage(event);
                return (
                  <article key={event.id} className="upcoming-event-card" {...cardProps(event, openEventModal)}>
                    <div
                      className="upcoming-event-image"
                      role="img"
                      aria-label={featuredImage ? `Event image for ${event.title}` : "No image available"}
                      style={featuredImage ? { backgroundImage: `url(${featuredImage})` } : undefined}
                    />
                    <div className="upcoming-event-content">
                      <time className="upcoming-event-date" dateTime={event.date}>
                        {formatDate(event.date)}
                      </time>
                      <h3>{event.title}</h3>
                      <div className="upcoming-event-details">
                        {event.time && (
                          <p className="upcoming-event-time">
                            <span className="detail-icon" role="img" aria-label="Time">🕐</span> {event.time}
                          </p>
                        )}
                        {event.location && (
                          <p className="upcoming-event-location">
                            <a
                              href={googleMapsUrl(event.location)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="event-location-link"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`View ${event.location} on Google Maps`}
                            >
                              <span className="detail-icon" role="img" aria-label="Location">📍</span>{" "}
                              {event.location}
                            </a>
                          </p>
                        )}
                      </div>
                      {event.date && (
                        <button
                          className="add-to-calendar-btn"
                          onClick={(e) => { e.stopPropagation(); downloadICS(event); }}
                          aria-label={`Add ${event.title} to calendar`}
                        >
                          📅 Add to Calendar
                        </button>
                      )}
                      {event.description && (
                        <p className="upcoming-event-description">{event.description}</p>
                      )}
                      <span className="event-read-more" aria-hidden="true">Read more...</span>
                    </div>
                  </article>
                );
              })
            ) : (
              <p>No upcoming events at this time. Check back soon!</p>
            )}
          </div>
        </div>
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="past-events section bg-light" aria-labelledby="past-events-heading">
          <div className="container">
            <h2 id="past-events-heading" className="section-title">Past Highlights</h2>
            <div className="past-events-grid">
              {pastEvents.map((event) => {
                const featuredImage = getEventImage(event);
                return (
                  <article key={event.id} className="past-event-card" {...cardProps(event, openEventModal)}>
                    <div
                      className="past-event-image"
                      role="img"
                      aria-label={featuredImage ? `Event image for ${event.title}` : "No image available"}
                      style={featuredImage ? { backgroundImage: `url(${featuredImage})` } : undefined}
                    />
                    <div className="past-event-content">
                      <time className="past-event-date" dateTime={event.date}>
                        {formatDate(event.date)}
                      </time>
                      <h3>{event.title}</h3>
                      {event.description && (
                        <p className="past-event-description">{event.description}</p>
                      )}
                      <span className="event-read-more" aria-hidden="true">Read more...</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Get Involved */}
      <section className="get-involved section" aria-labelledby="get-involved-heading">
        <div className="container">
          <div className="get-involved-content">
            <h2 id="get-involved-heading">Want to Help Plan Events?</h2>
            <p>
              We&apos;re always looking for passionate volunteers to help organize and
              run our events. Join our events committee and help create memorable
              experiences!
            </p>
            <div className="get-involved-buttons">
              <a
                href={siteConfig.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-rainbow"
                aria-label="Support Our Events (opens in new tab)"
              >
                Support Our Events
              </a>
              <a href="#footer" className="btn btn-cta-secondary">
                Get In Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Event Modal */}
      <Modal
        isOpen={eventModal.isOpen}
        onClose={closeEventModal}
        labelId="event-modal-title"
        maxWidth="900px"
      >
        {selectedEvent && (
          <>
            {/* Image gallery */}
            {selectedEvent.images?.length > 0 && (
              <div className="event-modal-gallery">
                <img
                  src={selectedEvent.images[currentImageIndex].image_url}
                  alt={`${selectedEvent.title} - Image ${currentImageIndex + 1}`}
                  className="event-modal-gallery-img"
                />
                {selectedEvent.images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="carousel-btn carousel-btn--prev" aria-label="Previous image">‹</button>
                    <button onClick={nextImage} className="carousel-btn carousel-btn--next" aria-label="Next image">›</button>
                    <div className="carousel-counter" role="status" aria-live="polite" aria-atomic="true">
                      Image {currentImageIndex + 1} of {selectedEvent.images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Event details */}
            <div className="event-modal-body">
              <time className="modal-date" dateTime={selectedEvent.date}>
                {formatDate(selectedEvent.date)}
              </time>
              <h2 id="event-modal-title">{selectedEvent.title}</h2>
              <div className="event-modal-meta">
                {selectedEvent.time && (
                  <p className="event-detail-row">
                    <span role="img" aria-label="Time">🕐</span>
                    <strong>Time:</strong> {selectedEvent.time}
                  </p>
                )}
                {selectedEvent.location && (
                  <p className="event-detail-row">
                    <a
                      href={googleMapsUrl(selectedEvent.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="event-location-link"
                      aria-label={`View ${selectedEvent.location} on Google Maps (opens in new tab)`}
                    >
                      <span role="img" aria-label="Location">📍</span>
                      <strong>Location:</strong> {selectedEvent.location}
                    </a>
                  </p>
                )}
                {selectedEvent.date && (
                  <p className="event-detail-row">
                    <button
                      className="add-to-calendar-btn"
                      onClick={() => downloadICS(selectedEvent)}
                      aria-label="Download calendar invite"
                    >
                      📅 Add to Calendar
                    </button>
                  </p>
                )}
              </div>
              {selectedEvent.description && (
                <p className="event-modal-description">{selectedEvent.description}</p>
              )}
              {selectedEvent.link && (
                <a
                  href={selectedEvent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-rainbow"
                >
                  Learn More →
                </a>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Events;
