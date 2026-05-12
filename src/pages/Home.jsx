import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSiteConfig } from "../config/siteConfig.jsx";
import toast from "react-hot-toast";
import StarBurstTarget from "../components/StarBurstTarget";
import "./Home.css";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

const GRADIENTS = ["rainbow-gradient", "purple-gradient", "pastel-gradient"];

const PLATFORM_LABELS = { facebook: "Facebook", instagram: "Instagram", twitter: "X", tiktok: "TikTok" };

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeFbPost(p) {
  return { id: `fb-${p.id}`, source: "facebook", text: p.message, image: p.full_picture || null, date: p.created_time, url: p.permalink_url };
}

function normalizeIgPost(p) {
  return { id: `ig-${p.id}`, source: "instagram", text: p.caption, image: p.media_url || p.thumbnail_url || null, date: p.timestamp, url: p.permalink };
}

function normalizeXPost(p) {
  return { id: `x-${p.id}`, source: "twitter", text: p.text, image: p.media_url || null, date: p.created_at, url: p.permalink_url };
}

function normalizeTiktokPost(p) {
  return { id: `tt-${p.id}`, source: "tiktok", text: p.video_description || p.title || "", image: p.cover_image_url || null, date: new Date(p.create_time * 1000).toISOString(), url: p.share_url };
}

const Home = () => {
  const siteConfig = useSiteConfig();
  const [homeContent, setHomeContent] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterName, setNewsletterName] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [newsPosts, setNewsPosts] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const newsFeedRef = useRef(null);

  useEffect(() => {
    const endpoints = [
      { url: "/api/facebook/posts", key: "posts", normalize: normalizeFbPost },
      { url: "/api/instagram/posts", key: "posts", normalize: normalizeIgPost },
      { url: "/api/twitter/posts", key: "posts", normalize: normalizeXPost },
      { url: "/api/tiktok/posts", key: "posts", normalize: normalizeTiktokPost },
    ];
    Promise.allSettled([
      ...endpoints.map(({ url, key, normalize }) =>
        fetch(url)
          .then((r) => r.json())
          .then((d) => (d[key] || []).map(normalize))
      ),
      fetch("/api/news/overrides").then((r) => r.json()).then((d) => d.overrides || []),
    ]).then((results) => {
      const postResults = results.slice(0, endpoints.length);
      const overridesResult = results[endpoints.length];
      const overrides = overridesResult.status === "fulfilled" ? overridesResult.value : [];
      const overrideMap = Object.fromEntries(overrides.map((o) => [o.post_id, o]));

      const all = postResults
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => r.value)
        .filter((post) => overrideMap[post.id]?.is_published !== false)
        .sort((a, b) => {
          const aOrder = overrideMap[a.id]?.display_order ?? Infinity;
          const bOrder = overrideMap[b.id]?.display_order ?? Infinity;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return new Date(b.date) - new Date(a.date);
        });
      if (all.length) setNewsPosts(all);
    });
  }, []);

  useEffect(() => {
    fetch("/api/content/home")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch home content");
        return res.json();
      })
      .then((data) => { if (data.data) setHomeContent(data.data); })
      .catch((err) => console.error("Error loading home content:", err));
  }, []);

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

  const scrollNews = (dir) => {
    const el = newsFeedRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

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

      {/* News Feed */}
      <section className="news section" aria-labelledby="news-heading">
        <div className="container">
          <h2 id="news-heading" className="section-title">
            Latest <span>News</span>
          </h2>
          {newsPosts.length > 0 ? (
            <div className="news-feed-wrapper" aria-label="Social media news feed">
              <button
                className="news-feed-btn news-feed-btn-prev"
                onClick={() => scrollNews(-1)}
                aria-label="Scroll news left"
              >
                &#8249;
              </button>
              <ul className="news-feed" ref={newsFeedRef} role="list">
                {newsPosts.map((post, i) => (
                  <li key={post.id} className="news-feed-card" role="listitem">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt=""
                        className="news-feed-card-img"
                        aria-hidden="true"
                      />
                    ) : (
                      <div
                        className={`news-feed-card-placeholder ${GRADIENTS[i % GRADIENTS.length]}`}
                        aria-hidden="true"
                      />
                    )}
                    <div className="news-feed-card-body">
                      <div className="news-feed-card-meta">
                        <span className="news-feed-source">{PLATFORM_LABELS[post.source]}</span>
                        <time className="news-date" dateTime={post.date}>
                          {formatDate(post.date)}
                        </time>
                      </div>
                      <p className="news-feed-card-text">{post.text}</p>
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-link"
                        aria-label={`View this post on ${PLATFORM_LABELS[post.source]} (opens in new tab)`}
                      >
                        View on {PLATFORM_LABELS[post.source]} →
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                className="news-feed-btn news-feed-btn-next"
                onClick={() => scrollNews(1)}
                aria-label="Scroll news right"
              >
                &#8250;
              </button>
            </div>
          ) : (
            <div className="news-feed-empty">
              <p>
                Follow us on{" "}
                <a
                  href={siteConfig.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>{" "}
                for the latest updates.
              </p>
            </div>
          )}
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
    </div>
  );
};

export default Home;
