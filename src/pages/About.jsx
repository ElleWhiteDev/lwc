import { SITE_CONFIG } from "../config/siteConfig";
import "./About.css";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

const About = () => {
  return (
    <div className="about">
      {/* Hero Section */}
      <section
        className="about-hero"
        style={{ backgroundImage: `url(${LWCHomeBackground})` }}
        aria-labelledby="about-title"
      >
        <div className="container">
          <h1 id="about-title">About Us</h1>
          <p className="about-hero-subtitle">
            Learn more about our mission, values, and the community we&apos;re
            building together.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-content">
              <h2>Our Mission</h2>
              <p>
                A Life Worth Celebrating is a nonprofit organization dedicated
                to creating inclusive spaces where everyone feels valued,
                celebrated, and supported. We believe that every life deserves
                to be honored and that together, we can build a more loving and
                accepting community.
              </p>
              <p>
                Through events, volunteer programs, and community outreach, we
                work to foster connection, spread joy, and advocate for
                equality. Our goal is simple: to make our community a place
                where every person can live authentically and proudly.
              </p>
            </div>
            <div className="mission-image">
              <div className="mission-card">
                <div className="mission-icon">💜</div>
                <h3>Love</h3>
                <p>At the heart of everything we do</p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">🌈</div>
                <h3>Inclusion</h3>
                <p>Everyone belongs here</p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">✨</div>
                <h3>Celebration</h3>
                <p>Every life is worth celebrating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values section bg-light">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Inclusivity</h3>
              <p>
                We welcome everyone regardless of background, identity, or
                beliefs. Our community is built on acceptance and understanding.
              </p>
            </div>
            <div className="value-card">
              <h3>Compassion</h3>
              <p>
                We approach every interaction with empathy and care, creating
                safe spaces for authentic connection.
              </p>
            </div>
            <div className="value-card">
              <h3>Celebration</h3>
              <p>
                We believe in celebrating life's moments, big and small, and
                honoring the unique journey of every individual.
              </p>
            </div>
            <div className="value-card">
              <h3>Community</h3>
              <p>
                Together we're stronger. We foster meaningful connections that
                create lasting impact in our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Board Section */}
      <section className="board section">
        <div className="container">
          <h2 className="section-title">Meet Our Board</h2>
          <p className="board-intro">
            Our dedicated board members volunteer their time and expertise to
            guide our mission.
          </p>
          <div className="board-grid">
            <div className="board-card">
              <div className="board-photo">
                <span>👤</span>
              </div>
              <h3>Board Member Name</h3>
              <p className="board-title">President</p>
            </div>
            <div className="board-card">
              <div className="board-photo">
                <span>👤</span>
              </div>
              <h3>Board Member Name</h3>
              <p className="board-title">Vice President</p>
            </div>
            <div className="board-card">
              <div className="board-photo">
                <span>👤</span>
              </div>
              <h3>Board Member Name</h3>
              <p className="board-title">Treasurer</p>
            </div>
            <div className="board-card">
              <div className="board-photo">
                <span>👤</span>
              </div>
              <h3>Board Member Name</h3>
              <p className="board-title">Secretary</p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved CTA */}
      <section
        className="about-cta section"
        aria-labelledby="about-cta-heading"
      >
        <div className="container">
          <div className="about-cta-content">
            <h2 id="about-cta-heading">Want to Join Our Mission?</h2>
            <p>
              Whether you want to volunteer, attend events, or support our
              cause, there are many ways to get involved with A Life Worth
              Celebrating.
            </p>
            <div className="about-cta-buttons">
              <a
                href={SITE_CONFIG.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-rainbow"
                aria-label="Make a Donation (opens in new tab)"
              >
                Make a Donation
              </a>
              <a
                href={SITE_CONFIG.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-cta-secondary"
                aria-label="Follow Us on Facebook (opens in new tab)"
              >
                Follow Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
