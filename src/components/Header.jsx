import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { SITE_CONFIG } from "../config/siteConfig";
import LogoWordmark from "./LogoWordmark";
import "./Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    closeMenu();
    navigate("/");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, closeMenu]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className="header" role="banner">
      <div className="header-container">
        <Link
          to="/"
          className="logo"
          onClick={handleLogoClick}
          aria-label="A Life Worth Celebrating - Go to homepage"
        >
	          <LogoWordmark />
        </Link>

        <nav
          id="main-navigation"
          className={`nav ${isMenuOpen ? "nav-open" : ""}`}
          role="navigation"
          aria-label="Main navigation"
        >
          <ul className="nav-list" role="list">
            <li>
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/events"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Events
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <a
            href={SITE_CONFIG.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="Visit our Facebook page (opens in new tab)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              width="24"
              height="24"
              aria-hidden="true"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
	        {/* Rainbow-border donate button for mobile (matches header hover style) */}
	        <a
	          href={SITE_CONFIG.donateUrl}
	          target="_blank"
	          rel="noopener noreferrer"
	          className="btn btn-primary mobile-donate-btn"
	          aria-label="Donate Now (opens in new tab)"
	        >
	          Donate
	        </a>
	        {/* Purple donate button for desktop */}
	        <a
	          href={SITE_CONFIG.donateUrl}
	          target="_blank"
	          rel="noopener noreferrer"
	          className="btn btn-primary donate-btn"
	          aria-label="Donate Now (opens in new tab)"
	        >
	          Donate Now
	        </a>
        </div>

        <button
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
