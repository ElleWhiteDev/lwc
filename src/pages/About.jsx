import { useState, useEffect } from "react";
import { useSiteConfig } from "../config/siteConfig.jsx";
import "./About.css";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

const About = () => {
  const siteConfig = useSiteConfig();
  const [aboutContent, setAboutContent] = useState(null);
  const [boardMembers, setBoardMembers] = useState([]);

  useEffect(() => {
    fetch("/api/content/about")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch about content");
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setAboutContent(data.data);
        }
      })
      .catch((err) => {
        console.error("Error loading about content:", err);
      });

    // Fetch board members
    fetch("/api/board-members")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch board members");
        return res.json();
      })
      .then((data) => {
        if (data.boardMembers) {
          setBoardMembers(data.boardMembers);
        }
      })
      .catch((err) => {
        console.error("Error loading board members:", err);
      });
  }, []);

  // Content with fallbacks
  const heroSubtitle =
    aboutContent?.heroSubtitle ||
    "Learn more about our mission, values, and the community we're building together.";

  const missionHeading = aboutContent?.missionHeading || "Our Mission";
  const missionParagraph1 =
    aboutContent?.missionParagraph1 ||
    "A Life Worth Celebrating is a nonprofit organization dedicated to creating inclusive spaces where everyone feels valued, celebrated, and supported. We believe that every life deserves to be honored and that together, we can build a more loving and accepting community.";
  const missionParagraph2 =
    aboutContent?.missionParagraph2 ||
    "Through events, volunteer programs, and community outreach, we work to foster connection, spread joy, and advocate for equality. Our goal is simple: to make our community a place where every person can live authentically and proudly.";

  const ctaHeading = aboutContent?.ctaHeading || "Get Involved";
  const ctaBody =
    aboutContent?.ctaBody ||
    "Whether you want to volunteer, attend an event, or support our cause, there are many ways to get involved with A Life Worth Celebrating.";

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
          <p className="about-hero-subtitle">{heroSubtitle}</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission section" aria-labelledby="mission-heading">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-content">
              <h2 id="mission-heading">{missionHeading}</h2>
              <p>{missionParagraph1}</p>
              <p>{missionParagraph2}</p>
            </div>
            <div className="mission-image">
              <article className="mission-card">
                <div className="mission-icon" role="img" aria-label="Purple heart emoji">💜</div>
                <h3>Love</h3>
                <p>At the heart of everything we do</p>
              </article>
              <article className="mission-card">
                <div className="mission-icon" role="img" aria-label="Rainbow emoji">🌈</div>
                <h3>Inclusion</h3>
                <p>Everyone belongs here</p>
              </article>
              <article className="mission-card">
                <div className="mission-icon" role="img" aria-label="Sparkles emoji">✨</div>
                <h3>Celebration</h3>
                <p>Every life is worth celebrating</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values section bg-light" aria-labelledby="values-heading">
        <div className="container">
          <h2 id="values-heading" className="section-title">Our Values</h2>
          <div className="values-grid">
            <article className="value-card">
              <h3>Inclusivity</h3>
              <p>
                We welcome everyone regardless of background, identity, or
                beliefs. Our community is built on acceptance and understanding.
              </p>
            </article>
            <article className="value-card">
              <h3>Compassion</h3>
              <p>
                We approach every interaction with empathy and care, creating
                safe spaces for authentic connection.
              </p>
            </article>
            <article className="value-card">
              <h3>Celebration</h3>
              <p>
                We believe in celebrating life's moments, big and small, and
                honoring the unique journey of every individual.
              </p>
            </article>
            <article className="value-card">
              <h3>Community</h3>
              <p>
                Together we're stronger. We foster meaningful connections that
                create lasting impact in our community.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Board Section */}
      <section className="board section" aria-labelledby="board-heading">
        <div className="container">
          <h2 id="board-heading" className="section-title">Meet Our Board</h2>
          <p className="board-intro">
            Our dedicated board members volunteer their time and expertise to
            guide our mission.
          </p>
          <div className="board-grid">
            {boardMembers.length > 0 ? (
              boardMembers.map((member) => (
                <article key={member.id} className="board-card">
                  <div className="board-photo">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={`Photo of ${member.name}, ${member.title}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span role="img" aria-label="Default profile icon">👤</span>
                    )}
                  </div>
                  <h3>{member.name}</h3>
                  <p className="board-title">{member.title}</p>
                </article>
              ))
            ) : (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--color-text-light)" }}>
                No board members to display yet.
              </p>
            )}
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
            <h2 id="about-cta-heading">{ctaHeading}</h2>
            <p>{ctaBody}</p>
            <div className="about-cta-buttons">
              <a
                href={siteConfig.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-rainbow"
                aria-label="Make a Donation (opens in new tab)"
              >
                Make a Donation
              </a>
              <a
                href={siteConfig.facebookUrl}
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
