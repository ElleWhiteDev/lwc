import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSiteConfig } from "../config/siteConfig.jsx";
import LogoWordmark from "./LogoWordmark";
import "./Header.css";

const Header = () => {
  const siteConfig = useSiteConfig();
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
          {siteConfig.logoUrl ? (
            <img src={siteConfig.logoUrl} alt="A Life Worth Celebrating" className="logo-image" />
          ) : (
            <LogoWordmark />
          )}
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
            <li>
              <NavLink
                to="/resources"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Resources
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          {siteConfig.facebookUrl && (
            <a
              href={siteConfig.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Visit our Facebook page (opens in new tab)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          )}
          {siteConfig.instagramUrl && (
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Visit our Instagram page (opens in new tab)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
          {siteConfig.xUrl && (
            <a
              href={siteConfig.xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Visit our X (Twitter) page (opens in new tab)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}
          {siteConfig.tiktokUrl && (
            <a
              href={siteConfig.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Visit our TikTok page (opens in new tab)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
              </svg>
            </a>
          )}
	        {/* Rainbow-border donate button for mobile (matches header hover style) */}
	        <a
	          href={siteConfig.donateUrl}
	          target="_blank"
	          rel="noopener noreferrer"
	          className="btn btn-primary mobile-donate-btn"
	          aria-label="Donate Now (opens in new tab)"
	        >
	          Donate
	        </a>
	        {/* Purple donate button for desktop */}
	        <a
	          href={siteConfig.donateUrl}
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
