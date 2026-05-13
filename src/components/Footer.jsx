import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSiteConfig } from "../config/siteConfig.jsx";
import "./Footer.css";
import LogoWordmark from "./LogoWordmark";

const Footer = () => {
  const { user } = useAuth();
  const siteConfig = useSiteConfig();

  return (
    <footer className="footer" id="footer" role="contentinfo">
      <div className="footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-info">
              <div className="footer-logo" aria-hidden="true">
                {siteConfig.logoUrl ? (
                  <img src={siteConfig.logoUrl} alt="" className="logo-image" />
                ) : (
                  <LogoWordmark />
                )}
              </div>
              <p className="footer-tagline">
                Celebrating diversity, fostering community, and creating spaces
                where everyone belongs.
              </p>
            </div>

            <div className="footer-contact">
              <h3 id="contact-heading">Get In Touch</h3>
              <p>Have a question or want to get involved? We&apos;d love to hear from you.</p>
              <a
                href="mailto:info@alwcwin.org"
                className="btn btn-primary"
                aria-label="Send us an email"
              >
                info@alwcwin.org
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>
            © {new Date().getFullYear()} A Life Worth Celebrating, Inc. All
            rights reserved.
            {user ? (
              <> · <Link to="/admin">Admin</Link></>
            ) : (
              <> · <Link to="/login">Login</Link></>
            )}
          </p>
          <p className="footer-credit">
            website by <a href="https://ellewhite.dev" target="_blank" rel="noopener noreferrer">ellewhite.dev</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
