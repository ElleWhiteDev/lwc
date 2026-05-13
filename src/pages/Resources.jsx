import { useState, useEffect } from "react";
import "./Resources.css";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

const DEFAULT_HERO_SUBTITLE = "Everything you need to get involved with A Life Worth Celebrating.";
const DEFAULT_INTRO = "Whether you're looking to perform, vend, volunteer, or partner with us, you'll find all of our forms and resources right here. If you have any questions or need assistance, don't hesitate to reach out to us at info@alwcwin.org — we'd love to hear from you.";

const Resources = () => {
  const [heroSubtitle, setHeroSubtitle] = useState(DEFAULT_HERO_SUBTITLE);
  const [introText, setIntroText] = useState(DEFAULT_INTRO);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch("/api/content/resources")
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("Failed to fetch")))
      .then((data) => {
        const content = data.data ?? {};
        if (content.heroSubtitle) setHeroSubtitle(content.heroSubtitle);
        if (content.introText) setIntroText(content.introText);
        if (Array.isArray(content.links)) setLinks(content.links);
      })
      .catch(() => {});
  }, []);

  const emailMatch = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.exec(introText);
  const email = emailMatch ? emailMatch[0] : null;
  const introParts = email ? introText.split(email) : null;

  return (
    <div className="resources">
      <section
        className="resources-hero"
        style={{ backgroundImage: `url(${LWCHomeBackground})` }}
        aria-labelledby="resources-title"
      >
        <div className="container">
          <h1 id="resources-title">Resources</h1>
          <p className="resources-hero-subtitle">{heroSubtitle}</p>
        </div>
      </section>

      <section className="resources-links section" aria-labelledby="resources-links-heading">
        <div className="container">
          <div className="resources-intro">
            <p>
              {introParts ? (
                <>
                  {introParts[0]}
                  <a href={`mailto:${email}`}>{email}</a>
                  {introParts[1]}
                </>
              ) : introText}
            </p>
          </div>

          <h2 id="resources-links-heading" className="section-title">Forms &amp; Links</h2>

          <div className="resources-grid">
            {links.map(({ id, label, description, href, icon }) => (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-card"
                aria-label={`${label} (opens in new tab)`}
              >
                <div className="resource-icon" aria-hidden="true">{icon}</div>
                <div className="resource-card-body">
                  <h3>{label}</h3>
                  <p>{description}</p>
                </div>
                <span className="resource-arrow" aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;
