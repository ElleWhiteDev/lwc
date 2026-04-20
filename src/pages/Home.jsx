import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useSiteConfig } from "../config/siteConfig.jsx";
import toast from "react-hot-toast";
import StarBurstTarget from "../components/StarBurstTarget";
import Modal from "../components/Modal";
import { useModal } from "../hooks/useModal";
import "./Home.css";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

// Static news items — replace with API data when a news endpoint is added
const NEWS_ITEMS = [
  {
    id: 1,
    date: "November 2024",
    title: "Winter Community Gathering Coming Soon!",
    excerpt:
      "Join us for our upcoming Winter Community Gathering! Stay tuned for details about this cozy celebration bringing our community together during the holiday season.",
    fullContent:
      "Join us for our upcoming Winter Community Gathering! Stay tuned for details about this cozy celebration bringing our community together during the holiday season.\n\nThis special event will feature warm beverages, community activities, and a chance to connect with fellow members. We're planning an evening of celebration, reflection, and togetherness as we close out the year.\n\nMore details including date, time, and location will be announced soon. Follow us on social media or check back here for updates!",
    gradient: "rainbow-gradient",
    link: "/events",
  },
  {
    id: 2,
    date: "October 2024",
    title: "Volunteer Appreciation Night",
    excerpt:
      "We celebrated our amazing volunteers who make our mission possible every day.",
    fullContent:
      "We celebrated our amazing volunteers who make our mission possible every day.\n\nOur Volunteer Appreciation Night was a wonderful evening of gratitude, recognition, and community. We honored the dedicated individuals who give their time, energy, and passion to support our mission.\n\nFrom event planning to outreach, from administrative support to creative contributions, our volunteers are the heart of our organization. Thank you to everyone who attended and to all our volunteers for everything you do!",
    gradient: "purple-gradient",
    link: "/about",
  },
  {
    id: 3,
    date: "September 2024",
    title: "New Partnership Announcement",
    excerpt:
      "We're excited to announce new partnerships with local businesses supporting our cause.",
    fullContent:
      "We're excited to announce new partnerships with local businesses supporting our cause.\n\nThese partnerships represent a growing commitment from our local business community to support LGBTQ+ inclusion and celebration in Winchester. Together, we're building a more welcoming and supportive environment for everyone.\n\nOur new partners include local restaurants, shops, and service providers who share our values and mission. We're grateful for their support and look forward to working together to create positive change in our community.",
    gradient: "pastel-gradient",
    link: "/about",
  },
];

const Home = () => {
  const siteConfig = useSiteConfig();
  const [homeContent, setHomeContent] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterName, setNewsletterName] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const newsModal = useModal();

  useEffect(() => {
    fetch("/api/content/home")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch home content");
        return res.json();
      })
      .then((data) => { if (data.data) setHomeContent(data.data); })
      .catch((err) => console.error("Error loading home content:", err));
  }, []);

  const openNewsModal = (item) => {
    setSelectedNews(item);
    newsModal.open();
  };

  const closeNewsModal = () => {
    newsModal.close();
    // Clear selection after the close animation
    setTimeout(() => setSelectedNews(null), 300);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast.error("Please enter your email address");
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail, name: newsletterName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to subscribe");
      toast.success(data.message || "Successfully subscribed to newsletter!");
      setNewsletterEmail("");
      setNewsletterName("");
    } catch (err) {
      toast.error(err.message || "Failed to subscribe to newsletter");
    } finally {
      setSubscribing(false);
    }
  };

  const prideFestivalPhotos = homeContent?.prideFestivalPhotos ?? [];

  const carouselPrev = useCallback(() => {
    setCarouselIndex((i) => (i === 0 ? prideFestivalPhotos.length - 1 : i - 1));
  }, [prideFestivalPhotos.length]);

  const carouselNext = useCallback(() => {
    setCarouselIndex((i) => (i === prideFestivalPhotos.length - 1 ? 0 : i + 1));
  }, [prideFestivalPhotos.length]);

  useEffect(() => {
    if (prideFestivalPhotos.length < 2) return;
    const id = setInterval(carouselNext, 4000);
    return () => clearInterval(id);
  }, [prideFestivalPhotos.length, carouselNext]);

  // Content with API-driven fallbacks
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

  return (
    <div className="home">
      {/* Hero */}
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

          <StarBurstTarget className="hero-image" />
        </div>
      </section>

      {/* Pride Festival Highlight */}
      <section className="pride-highlight section" aria-labelledby="pride-festival-heading">
        <div className="container">
          <div className="highlight-card">
            <h2 id="pride-festival-heading">{prideFestivalTitle}</h2>
            <p>{prideFestivalDescription}</p>
            <div className="highlight-stats" role="list" aria-label="Pride Festival statistics">
              <div className="stat" role="listitem">
                <span className="stat-number" aria-label={`${prideAttendees} attendees`}>{prideAttendees}</span>
                <span className="stat-label" aria-hidden="true">Attendees</span>
              </div>
              <div className="stat" role="listitem">
                <span className="stat-number" aria-label={`${prideVendors} vendors`}>{prideVendors}</span>
                <span className="stat-label" aria-hidden="true">Vendors</span>
              </div>
              <div className="stat" role="listitem">
                <span className="stat-number" aria-label={`${prideShows} shows`}>{prideShows}</span>
                <span className="stat-label" aria-hidden="true">Shows</span>
              </div>
            </div>
            {prideFestivalPhotos.length > 0 ? (
              <section className="photo-carousel" aria-label="Festival photo carousel">
                <div className="carousel-track">
                  <img
                    key={prideFestivalPhotos[carouselIndex]}
                    src={prideFestivalPhotos[carouselIndex]}
                    alt={`Pride Festival — ${carouselIndex + 1} of ${prideFestivalPhotos.length}`}
                    className="carousel-image"
                  />
                  {prideFestivalPhotos.length > 1 && (
                    <>
                      <button className="carousel-btn carousel-btn-prev" onClick={carouselPrev} aria-label="Previous photo">&#8249;</button>
                      <button className="carousel-btn carousel-btn-next" onClick={carouselNext} aria-label="Next photo">&#8250;</button>
                    </>
                  )}
                </div>
                {prideFestivalPhotos.length > 1 && (
                  <div className="carousel-dots" role="tablist" aria-label="Photo navigation">
                    {prideFestivalPhotos.map((url, i) => (
                      <button
                        key={url}
                        className={`carousel-dot${i === carouselIndex ? " active" : ""}`}
                        onClick={() => setCarouselIndex(i)}
                        role="tab"
                        aria-selected={i === carouselIndex}
                        aria-label={`Go to photo ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <div className="photo-carousel">
                <output className="carousel-placeholder" aria-label="Photo gallery placeholder">
                  <span aria-hidden="true">📸</span>
                  <p>Photo Gallery Coming Soon</p>
                </output>
              </div>
            )}
            <Link to="/events" className="btn btn-primary">
              See More Events
            </Link>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="what-we-do section bg-light" aria-labelledby="what-we-do-heading">
        <div className="container">
          <h2 id="what-we-do-heading" className="section-title">
            What We <span>Do</span>
          </h2>
          <div className="services-grid">
            {[
              { icon: "🎉", label: "Party celebration emoji", title: "Community Events", desc: "From pride festivals to community picnics, we create spaces for celebration and connection." },
              { icon: "🤝", label: "Handshake emoji", title: "Volunteer Programs", desc: "Make a difference in your community through our volunteer opportunities and outreach programs." },
              { icon: "💜", label: "Purple heart emoji", title: "Support Resources", desc: "Access resources, connect with allies, and find support within our inclusive community." },
              { icon: "📣", label: "Megaphone emoji", title: "Advocacy", desc: "We advocate for equality and work to create positive change in our local community." },
            ].map(({ icon, label, title, desc }) => (
              <article key={title} className="service-card">
                <div className="service-icon" role="img" aria-label={label}>{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="news section" aria-labelledby="news-heading">
        <div className="container">
          <h2 id="news-heading" className="section-title">
            Latest <span>News</span>
          </h2>
          <div className="news-grid">
            {NEWS_ITEMS.map((item, index) => (
              <article
                key={item.id}
                className={index === 0 ? "news-card featured" : "news-card"}
                onClick={() => openNewsModal(item)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openNewsModal(item); } }}
                tabIndex={0}
                role="button"
                aria-label={`Read more about ${item.title}`}
                style={{ cursor: "pointer" }}
              >
                <div className={`news-image ${item.gradient}`} aria-hidden="true"></div>
                <div className="news-content">
                  <time className="news-date" dateTime={item.date}>{item.date}</time>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <span className="news-link" aria-hidden="true">Read More →</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section section" aria-labelledby="newsletter-heading">
        <div className="container">
          <div className="newsletter-content">
            <h2 id="newsletter-heading">Stay Connected</h2>
            <p>
              Subscribe to our newsletter to receive updates about upcoming events,
              community news, and ways to get involved.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="newsletter-form"
              aria-label="Newsletter subscription form"
            >
              <label htmlFor="newsletter-name" className="visually-hidden">
                Your name (optional)
              </label>
              <input
                type="text"
                id="newsletter-name"
                name="name"
                placeholder="Your name (optional)"
                value={newsletterName}
                onChange={(e) => setNewsletterName(e.target.value)}
              />
              <label htmlFor="newsletter-email" className="visually-hidden">
                Your email address (required)
              </label>
              <input
                type="email"
                id="newsletter-email"
                name="email"
                placeholder="Your email address *"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                aria-required="true"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={subscribing}
                aria-disabled={subscribing}
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
      <Modal
        isOpen={newsModal.isOpen}
        onClose={closeNewsModal}
        labelId="news-modal-title"
        maxWidth="700px"
      >
        {selectedNews && (
          <div className="modal-body">
            <time className="modal-date" dateTime={selectedNews.date}>
              {selectedNews.date}
            </time>
            <h2 id="news-modal-title">{selectedNews.title}</h2>
            <p className="modal-text">{selectedNews.fullContent}</p>
            {selectedNews.link && (
              <Link
                to={selectedNews.link}
                className="btn btn-rainbow"
                onClick={closeNewsModal}
              >
                Learn More →
              </Link>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
