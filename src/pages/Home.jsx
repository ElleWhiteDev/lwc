import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useSiteConfig } from "../config/siteConfig.jsx";
import toast from "react-hot-toast";
import "./Home.css";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

const Home = () => {
  const siteConfig = useSiteConfig();
  const [homeContent, setHomeContent] = useState(null);
  const [stars, setStars] = useState([]);

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterName, setNewsletterName] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const heroImageRef = useRef(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/content/home")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch home content");
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setHomeContent(data.data);
        }
      })
      .catch((err) => {
        console.error("Error loading home content:", err);
      });
  }, []);

  const createStarBurst = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Create 12 stars that shoot out in different directions
    const newStars = Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30 * Math.PI) / 180; // Spread evenly in a circle
      const velocity = 2 + Math.random() * 2; // Random velocity
      const size = 8 + Math.random() * 8; // Random size between 8-16px

      return {
        id: Date.now() + i,
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2, // Bias upward
        size,
        rotation: Math.random() * 360,
        color: [
          "#E40303",
          "#FF8C00",
          "#FFED00",
          "#008026",
          "#24408E",
          "#732982",
        ][Math.floor(Math.random() * 6)], // Pride colors
      };
    });

    setStars((prev) => [...prev, ...newStars]);

    // Remove stars after animation
    setTimeout(() => {
      setStars((prev) => prev.filter((star) => !newStars.includes(star)));
    }, 1500);
  };

	  // Handle touch separately so we can prevent the default tap highlight
	  // while still triggering the same starburst effect.
	  const createStarBurstFromTouch = (e) => {
	    if (e.cancelable) {
	      e.preventDefault();
	    }
	    if (!e.touches || e.touches.length === 0) return;

	    const touch = e.touches[0];
	    createStarBurst({
	      currentTarget: e.currentTarget,
	      clientX: touch.clientX,
	      clientY: touch.clientY,
	    });
	  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!newsletterEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setSubscribing(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newsletterEmail,
          name: newsletterName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      toast.success(data.message || "Successfully subscribed to newsletter!");
      setNewsletterEmail("");
      setNewsletterName("");
    } catch (err) {
      toast.error(err.message || "Failed to subscribe to newsletter");
    } finally {
      setSubscribing(false);
    }
  };

  // Content with fallbacks
  const heroSubtitle =
    homeContent?.heroSubtitle ||
    "A Life Worth Celebrating is a nonprofit organization dedicated to advancing inclusion, education, and community engagement for LGBTQ+ individuals and allies in Winchester, Kentucky. Through public events, cultural programming, and visibility initiatives, we work to foster safety, dignity, and belonging—ensuring that every person has the opportunity to live a life worth celebrating.";

  const prideFestivalTitle = homeContent?.prideFestivalTitle || "Pride Festival 2024";
  const prideFestivalDescription =
    homeContent?.prideFestivalDescription ||
    "Thank you to everyone who joined us for an incredible Pride Festival! Together, we celebrated diversity, spread love, and created unforgettable memories. Our community came together with music, art, food, and most importantly — love.";
  const prideAttendees = homeContent?.prideAttendees || "750+";
  const prideVendors = homeContent?.prideVendors || "35+";
  const prideShows = homeContent?.prideShows || "8";

  const ctaHeading = homeContent?.ctaHeading || "Ready to Make a Difference?";
  const ctaBody =
    homeContent?.ctaBody ||
    "Join our community of supporters and help us create a world where every life is celebrated.";

  // News items data
  const newsItems = [
    {
      id: 1,
      date: "November 2024",
      title: "Winter Community Gathering Coming Soon!",
      excerpt: "Join us for our upcoming Winter Community Gathering! Stay tuned for details about this cozy celebration bringing our community together during the holiday season.",
      fullContent: "Join us for our upcoming Winter Community Gathering! Stay tuned for details about this cozy celebration bringing our community together during the holiday season.\n\nThis special event will feature warm beverages, community activities, and a chance to connect with fellow members. We're planning an evening of celebration, reflection, and togetherness as we close out the year.\n\nMore details including date, time, and location will be announced soon. Follow us on social media or check back here for updates!",
      gradient: "rainbow-gradient",
      link: "/events"
    },
    {
      id: 2,
      date: "October 2024",
      title: "Volunteer Appreciation Night",
      excerpt: "We celebrated our amazing volunteers who make our mission possible every day.",
      fullContent: "We celebrated our amazing volunteers who make our mission possible every day.\n\nOur Volunteer Appreciation Night was a wonderful evening of gratitude, recognition, and community. We honored the dedicated individuals who give their time, energy, and passion to support our mission.\n\nFrom event planning to outreach, from administrative support to creative contributions, our volunteers are the heart of our organization. Thank you to everyone who attended and to all our volunteers for everything you do!",
      gradient: "purple-gradient",
      link: "/about"
    },
    {
      id: 3,
      date: "September 2024",
      title: "New Partnership Announcement",
      excerpt: "We're excited to announce new partnerships with local businesses supporting our cause.",
      fullContent: "We're excited to announce new partnerships with local businesses supporting our cause.\n\nThese partnerships represent a growing commitment from our local business community to support LGBTQ+ inclusion and celebration in Winchester. Together, we're building a more welcoming and supportive environment for everyone.\n\nOur new partners include local restaurants, shops, and service providers who share our values and mission. We're grateful for their support and look forward to working together to create positive change in our community.",
      gradient: "pastel-gradient",
      link: "/about"
    }
  ];

  // Modal handlers for news
  const openNewsModal = (newsItem) => {
    setSelectedNews(newsItem);
    setIsNewsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeNewsModal = () => {
    setIsNewsModalOpen(false);
    document.body.style.overflow = 'unset';
    setTimeout(() => {
      setSelectedNews(null);
    }, 300);
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isNewsModalOpen) {
        closeNewsModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isNewsModalOpen]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section
        className="hero"
        style={{ backgroundImage: `url(${LWCHomeBackground})` }}
        aria-labelledby="hero-title"
      >
        <div className="container hero-container">
          <div className="hero-content">
            <h1 id="hero-title" className="hero-title">
              <span className="title-block">A Life Worth</span>
              <span className="title-script" aria-label="Celebrating">
                <span aria-hidden="true">
                  <span className="letter-C">C</span>
                  <span className="letter-e1">e</span>
                  <span className="letter-l">l</span>
                  <span className="letter-e2">e</span>
                  <span className="letter-b">b</span>
                  <span className="letter-r">r</span>
                  <span className="letter-a">a</span>
                  <span className="letter-t">t</span>
                  <span className="letter-i">i</span>
                  <span className="letter-n">n</span>
                  <span className="letter-g">g</span>
                </span>
              </span>
            </h1>
            <p className="hero-subtitle">{heroSubtitle}</p>
            <div className="hero-buttons">
              <Link to="/events" className="btn btn-primary">
                Upcoming Events
              </Link>
              <a
                href={siteConfig.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-rainbow"
                aria-label="Donate Now (opens in new tab)"
              >
                Donate Now
              </a>
            </div>
          </div>
          <div
            className="hero-image"
            ref={heroImageRef}
	            onClick={createStarBurst}
	            onTouchStart={createStarBurstFromTouch}
            style={{ cursor: "pointer", position: "relative" }}
          >
            {stars.map((star) => (
              <div
                key={star.id}
                className="star-particle"
                style={{
                  left: `${star.x}px`,
                  top: `${star.y}px`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  backgroundColor: star.color,
                  "--vx": star.vx,
                  "--vy": star.vy,
                  "--rotation": `${star.rotation}deg`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pride Festival Highlight */}
      <section className="pride-highlight section">
        <div className="container">
          <div className="highlight-card">
            <h2>{prideFestivalTitle}</h2>
            <p>{prideFestivalDescription}</p>
            <div className="highlight-stats">
              <div className="stat">
                <span className="stat-number">{prideAttendees}</span>
                <span className="stat-label">Attendees</span>
              </div>
              <div className="stat">
                <span className="stat-number">{prideVendors}</span>
                <span className="stat-label">Vendors</span>
              </div>
              <div className="stat">
                <span className="stat-number">{prideShows}</span>
                <span className="stat-label">Shows</span>
              </div>
            </div>
            {/* Photo Carousel Placeholder */}
            <div className="photo-carousel">
              <div className="carousel-placeholder">
                <span>📸</span>
                <p>Photo Gallery Coming Soon</p>
              </div>
            </div>
            <Link to="/events" className="btn btn-primary">
              See More Events
            </Link>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="what-we-do section bg-light">
        <div className="container">
          <h2 className="section-title">
            What We <span>Do</span>
          </h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🎉</div>
              <h3>Community Events</h3>
              <p>
                From pride festivals to community picnics, we create spaces for
                celebration and connection.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">🤝</div>
              <h3>Volunteer Programs</h3>
              <p>
                Make a difference in your community through our volunteer
                opportunities and outreach programs.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">💜</div>
              <h3>Support Resources</h3>
              <p>
                Access resources, connect with allies, and find support within
                our inclusive community.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">📣</div>
              <h3>Advocacy</h3>
              <p>
                We advocate for equality and work to create positive change in
                our local community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="news section">
        <div className="container">
          <h2 className="section-title">
            Latest <span>News</span>
          </h2>
          <div className="news-grid">
            {newsItems.map((newsItem, index) => (
              <article
                key={newsItem.id}
                className={index === 0 ? "news-card featured" : "news-card"}
                onClick={() => openNewsModal(newsItem)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`news-image ${newsItem.gradient}`}></div>
                <div className="news-content">
                  <span className="news-date">{newsItem.date}</span>
                  <h3>{newsItem.title}</h3>
                  <p>{newsItem.excerpt}</p>
                  <span className="news-link">Read More →</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="newsletter-section section" style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)" }}>
        <div className="container">
          <div className="newsletter-content" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ marginBottom: "var(--spacing-md)" }}>Stay Connected</h2>
            <p style={{ marginBottom: "var(--spacing-xl)", color: "var(--color-text-light)" }}>
              Subscribe to our newsletter to receive updates about upcoming events, community news, and ways to get involved.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={newsletterName}
                onChange={(e) => setNewsletterName(e.target.value)}
                style={{
                  padding: "var(--spacing-md)",
                  borderRadius: "var(--radius-md)",
                  border: "2px solid #e5e7eb",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--primary-purple)"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              />
              <input
                type="email"
                placeholder="Your email address *"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                style={{
                  padding: "var(--spacing-md)",
                  borderRadius: "var(--radius-md)",
                  border: "2px solid #e5e7eb",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--primary-purple)"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={subscribing}
                style={{ width: "100%" }}
              >
                {subscribing ? "Subscribing..." : "Subscribe to Newsletter"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta section" aria-labelledby="cta-heading">
        <div className="container">
          <div className="cta-content">
            <h2 id="cta-heading">{ctaHeading}</h2>
            <p>{ctaBody}</p>
            <div className="cta-buttons">
              <a
                href={siteConfig.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-rainbow"
                aria-label="Donate Now (opens in new tab)"
              >
                Donate Now
              </a>
              <Link to="/events" className="btn btn-cta-secondary-dark">
                Get Involved
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* News Modal */}
      {isNewsModalOpen && selectedNews && (
        <div
          className="event-modal-overlay"
          onClick={closeNewsModal}
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
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              animation: 'slideUp 0.3s ease-in-out'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeNewsModal}
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
              aria-label="Close modal"
            >
              ×
            </button>

            {/* News Content */}
            <div style={{ padding: 'var(--spacing-xl)' }}>
              <span
                style={{
                  display: 'inline-block',
                  color: 'var(--primary-purple)',
                  fontWeight: '600',
                  fontSize: '14px',
                  marginBottom: 'var(--spacing-sm)'
                }}
              >
                {selectedNews.date}
              </span>

              <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
                {selectedNews.title}
              </h2>

              <div style={{
                lineHeight: '1.8',
                color: 'var(--dark-gray)',
                whiteSpace: 'pre-line'
              }}>
                {selectedNews.fullContent}
              </div>

              {selectedNews.link && (
                <Link
                  to={selectedNews.link}
                  className="btn btn-rainbow"
                  style={{ display: 'inline-block', marginTop: 'var(--spacing-xl)' }}
                  onClick={closeNewsModal}
                >
                  Learn More →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
