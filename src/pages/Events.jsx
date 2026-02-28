import { useState, useEffect } from "react";
import { useSiteConfig } from "../config/siteConfig.jsx";
import "./Events.css";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

const Events = () => {
  const siteConfig = useSiteConfig();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading events:", err);
        setLoading(false);
      });
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    const date = new Date(dateString);
    // If date is invalid, return "Date TBA"
    if (isNaN(date.getTime())) return "Date TBA";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Modal functions
  const openEventModal = (event) => {
    setSelectedEvent(event);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedEvent(null);
      setCurrentImageIndex(0);
    }, 300); // After animation
  };

  // Handle body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const nextImage = () => {
    if (selectedEvent && selectedEvent.images) {
      setCurrentImageIndex((prev) =>
        prev === selectedEvent.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedEvent && selectedEvent.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedEvent.images.length - 1 : prev - 1
      );
    }
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeEventModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Split events into upcoming and past based on date
  const now = new Date();
  const upcomingEvents = events.filter((event) => {
    if (!event.date) return true; // Show events without dates as upcoming
    const eventDate = new Date(event.date);
    // If date is invalid (like "Soonish"), show as upcoming
    if (isNaN(eventDate.getTime())) return true;
    return eventDate >= now;
  });

  const pastEvents = events.filter((event) => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    // If date is invalid, don't show in past events
    if (isNaN(eventDate.getTime())) return false;
    return eventDate < now;
  });

  return (
    <div className="events">
      {/* Hero Section */}
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

      {/* Upcoming Events - Expanded Card Layout */}
      <section className="upcoming-events section" aria-labelledby="upcoming-events-heading">
        <div className="container">
          <h2 id="upcoming-events-heading" className="section-title">Upcoming Events</h2>
          <div className="upcoming-events-list">
            {loading ? (
              <p role="status" aria-live="polite">Loading events...</p>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                // Get first image from images array or fall back to image_url
                const featuredImage = event.images && event.images.length > 0
                  ? event.images[0].image_url
                  : event.image_url;

                return (
                  <article
                    key={event.id}
                    className="upcoming-event-card"
                    onClick={() => openEventModal(event)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openEventModal(event);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${event.title}`}
                  >
                    {featuredImage && (
                      <div
                        className="upcoming-event-image"
                        role="img"
                        aria-label={`Event image for ${event.title}`}
                        style={{
                          backgroundImage: `url(${featuredImage})`,
                        }}
                      ></div>
                    )}
                    {!featuredImage && <div className="upcoming-event-image" role="img" aria-label="No image available"></div>}
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
                            <span className="detail-icon" role="img" aria-label="Location">📍</span>{" "}
                            {event.location}
                          </p>
                        )}
                      </div>
                      {event.description && (
                        <p className="upcoming-event-description">
                          {event.description}
                        </p>
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
                // Get first image from images array or fall back to image_url
                const featuredImage = event.images && event.images.length > 0
                  ? event.images[0].image_url
                  : event.image_url;

                return (
                  <article
                    key={event.id}
                    className="past-event-card"
                    onClick={() => openEventModal(event)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openEventModal(event);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${event.title}`}
                  >
                    {featuredImage && (
                      <div
                        className="past-event-image"
                        role="img"
                        aria-label={`Event image for ${event.title}`}
                        style={{
                          backgroundImage: `url(${featuredImage})`,
                        }}
                      ></div>
                    )}
                    {!featuredImage && <div className="past-event-image" role="img" aria-label="No image available"></div>}
                    <div className="past-event-content">
                      <time className="past-event-date" dateTime={event.date}>
                        {formatDate(event.date)}
                      </time>
                      <h3>{event.title}</h3>
                      {event.description && (
                        <p style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: 'var(--spacing-sm)'
                        }}>
                          {event.description}
                        </p>
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
      <section
        className="get-involved section"
        aria-labelledby="get-involved-heading"
      >
        <div className="container">
          <div className="get-involved-content">
            <h2 id="get-involved-heading">Want to Help Plan Events?</h2>
            <p>
              We&apos;re always looking for passionate volunteers to help
              organize and run our events. Join our events committee and help
              create memorable experiences!
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
      {isModalOpen && selectedEvent && (
        <div
          className="event-modal-overlay"
          onClick={closeEventModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 'var(--spacing-lg)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <div
            className="event-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              animation: 'slideUp 0.3s ease-in-out'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeEventModal}
              style={{
                position: 'absolute',
                top: 'var(--spacing-md)',
                right: 'var(--spacing-md)',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
              aria-label="Close event dialog"
            >
              ×
            </button>

            {/* Image Gallery */}
            {selectedEvent.images && selectedEvent.images.length > 0 && (
              <div style={{ position: 'relative', backgroundColor: 'var(--black)' }}>
                <img
                  src={selectedEvent.images[currentImageIndex].image_url}
                  alt={`${selectedEvent.title} - Image ${currentImageIndex + 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />

                {/* Image Navigation */}
                {selectedEvent.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      style={{
                        position: 'absolute',
                        left: 'var(--spacing-md)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        fontSize: '24px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      style={{
                        position: 'absolute',
                        right: 'var(--spacing-md)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        fontSize: '24px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
                      aria-label="Next image"
                    >
                      ›
                    </button>

                    {/* Image Counter */}
                    <div
                      role="status"
                      aria-live="polite"
                      aria-atomic="true"
                      style={{
                        position: 'absolute',
                        bottom: 'var(--spacing-md)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: 'var(--spacing-xs) var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px'
                      }}
                    >
                      Image {currentImageIndex + 1} of {selectedEvent.images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Event Details */}
            <div style={{ padding: 'var(--spacing-xl)' }}>
              <time
                dateTime={selectedEvent.date}
                style={{
                  display: 'inline-block',
                  color: 'var(--primary-purple)',
                  fontWeight: '600',
                  fontSize: '14px',
                  marginBottom: 'var(--spacing-sm)'
                }}
              >
                {formatDate(selectedEvent.date)}
              </time>

              <h2 id="event-modal-title" style={{ marginBottom: 'var(--spacing-md)' }}>
                {selectedEvent.title}
              </h2>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                {selectedEvent.time && (
                  <p style={{
                    marginBottom: 'var(--spacing-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                  }}>
                    <span style={{ fontSize: '18px' }} role="img" aria-label="Time">🕐</span>
                    <strong>Time:</strong> {selectedEvent.time}
                  </p>
                )}
                {selectedEvent.location && (
                  <p style={{
                    marginBottom: 'var(--spacing-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                  }}>
                    <span style={{ fontSize: '18px' }} role="img" aria-label="Location">📍</span>
                    <strong>Location:</strong> {selectedEvent.location}
                  </p>
                )}
              </div>

              {selectedEvent.description && (
                <p style={{
                  lineHeight: '1.6',
                  marginBottom: 'var(--spacing-lg)',
                  color: 'var(--dark-gray)'
                }}>
                  {selectedEvent.description}
                </p>
              )}

              {selectedEvent.link && (
                <a
                  href={selectedEvent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-rainbow"
                  style={{ display: 'inline-block' }}
                >
                  Learn More →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
