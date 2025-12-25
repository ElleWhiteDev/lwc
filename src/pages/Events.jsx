import { SITE_CONFIG } from "../config/siteConfig";
import "./Events.css";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

const Events = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "Winter Community Gathering",
      date: "December 15, 2024",
      time: "5:00 PM - 9:00 PM",
      location: "Community Center",
      description:
        "Join us for a cozy winter celebration! Hot cocoa, live music, and community connection.",
    },
    {
      id: 2,
      title: "Volunteer Orientation",
      date: "January 8, 2025",
      time: "10:00 AM - 12:00 PM",
      location: "Main Office",
      description:
        "Learn about volunteer opportunities and how you can make a difference in our community.",
    },
    {
      id: 3,
      title: "Community Support Group",
      date: "Every Tuesday",
      time: "7:00 PM - 8:30 PM",
      location: "Virtual (Zoom)",
      description:
        "A safe, welcoming space to connect, share, and support one another.",
    },
    {
      id: 4,
      title: "Spring Pride Planning Meeting",
      date: "February 1, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Community Center",
      description:
        "Help us plan our upcoming Pride Festival! All ideas and volunteers welcome.",
    },
  ];

  const pastEvents = [
    {
      id: 5,
      title: "Pride Festival 2024",
      date: "June 2024",
      description:
        "Our biggest celebration yet! Over 500 attendees came together to celebrate love and diversity.",
      highlight: true,
    },
    {
      id: 6,
      title: "Volunteer Appreciation Night",
      date: "October 2024",
      description:
        "We honored our incredible volunteers who make our mission possible every day.",
    },
    {
      id: 7,
      title: "Fall Community Picnic",
      date: "September 2024",
      description:
        "A beautiful afternoon of food, games, and connection at the park.",
    },
  ];

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
      <section className="upcoming-events section">
        <div className="container">
          <h2 className="section-title">Upcoming Events</h2>
          <div className="upcoming-events-list">
            {upcomingEvents.map((event) => (
              <article key={event.id} className="upcoming-event-card">
                <div className="upcoming-event-image"></div>
                <div className="upcoming-event-content">
                  <span className="upcoming-event-date">{event.date}</span>
                  <h3>{event.title}</h3>
                  <div className="upcoming-event-details">
                    <p className="upcoming-event-time">
                      <span className="detail-icon">🕐</span> {event.time}
                    </p>
                    <p className="upcoming-event-location">
                      <span className="detail-icon">📍</span> {event.location}
                    </p>
                  </div>
                  <p className="upcoming-event-description">
                    {event.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="past-events section bg-light">
        <div className="container">
          <h2 className="section-title">Past Highlights</h2>
          <div className="past-events-grid">
            {pastEvents.map((event) => (
              <article
                key={event.id}
                className={`past-event-card ${event.highlight ? "highlight" : ""}`}
              >
                <div className="past-event-image">
                  {event.highlight && <div className="rainbow-overlay"></div>}
                </div>
                <div className="past-event-content">
                  <span className="past-event-date">{event.date}</span>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

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
                href={SITE_CONFIG.donateUrl}
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
    </div>
  );
};

export default Events;
