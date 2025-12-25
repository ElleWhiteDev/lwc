import { Link } from "react-router-dom";
import { SITE_CONFIG } from "../config/siteConfig";
import "./Home.css";
import GirlWithFlag from "../assets/images/Girl with Flag.svg";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

const Home = () => {
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
            <p className="hero-subtitle">
              A Life Worth Celebrating is a nonprofit organization dedicated to
              advancing inclusion, education, and community engagement for
              LGBTQ+ individuals and allies in Winchester, Kentucky. Through
              public events, cultural programming, and visibility initiatives,
              we work to foster safety, dignity, and belonging—ensuring that
              every person has the opportunity to live a life worth celebrating.
            </p>
            <div className="hero-buttons">
              <Link to="/events" className="btn btn-primary">
                Upcoming Events
              </Link>
              <a
                href={SITE_CONFIG.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-rainbow"
                aria-label="Donate Now (opens in new tab)"
              >
                Donate Now
              </a>
            </div>
          </div>
          <div className="hero-image">
            <img
              src={GirlWithFlag}
              alt="Illustration of person celebrating with pride flag"
            />
          </div>
        </div>
      </section>

      {/* Pride Festival Highlight */}
      <section className="pride-highlight section">
        <div className="container">
          <div className="highlight-card">
            <h2>Pride Festival 2024</h2>
            <p>
              Thank you to everyone who joined us for an incredible Pride
              Festival! Together, we celebrated diversity, spread love, and
              created unforgettable memories. Our community came together with
              music, art, food, and most importantly — love.
            </p>
            <div className="highlight-stats">
              <div className="stat">
                <span className="stat-number">750+</span>
                <span className="stat-label">Attendees</span>
              </div>
              <div className="stat">
                <span className="stat-number">35+</span>
                <span className="stat-label">Vendors</span>
              </div>
              <div className="stat">
                <span className="stat-number">8</span>
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
            <article className="news-card featured">
              <div className="news-image rainbow-gradient"></div>
              <div className="news-content">
                <span className="news-date">November 2024</span>
                <h3>Winter Community Gathering Coming Soon!</h3>
                <p>
                  Join us for our upcoming Winter Community Gathering! Stay
                  tuned for details about this cozy celebration bringing our
                  community together during the holiday season.
                </p>
                <Link to="/events" className="news-link">
                  Learn More →
                </Link>
              </div>
            </article>
            <article className="news-card">
              <div className="news-image purple-gradient"></div>
              <div className="news-content">
                <span className="news-date">October 2024</span>
                <h3>Volunteer Appreciation Night</h3>
                <p>
                  We celebrated our amazing volunteers who make our mission
                  possible every day.
                </p>
                <Link to="/about" className="news-link">
                  Read More →
                </Link>
              </div>
            </article>
            <article className="news-card">
              <div className="news-image pastel-gradient"></div>
              <div className="news-content">
                <span className="news-date">September 2024</span>
                <h3>New Partnership Announcement</h3>
                <p>
                  We're excited to announce new partnerships with local
                  businesses supporting our cause.
                </p>
                <Link to="/about" className="news-link">
                  Read More →
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta section" aria-labelledby="cta-heading">
        <div className="container">
          <div className="cta-content">
            <h2 id="cta-heading">Ready to Make a Difference?</h2>
            <p>
              Join our community of supporters and help us create a world where
              every life is celebrated.
            </p>
            <div className="cta-buttons">
              <a
                href={SITE_CONFIG.donateUrl}
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
