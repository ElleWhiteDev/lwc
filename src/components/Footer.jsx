import { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Footer.css";
import LogoWordmark from "./LogoWordmark";

// Separate ContactForm component so it can be reset via key prop
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  if (submitted) {
    return (
      <output className="success-message" aria-live="polite">
        <span className="success-icon" aria-hidden="true">
          ✓
        </span>
        <p>Thank you! We&apos;ll be in touch soon.</p>
      </output>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="footer-form"
      noValidate
      aria-label="Contact form"
    >
      <div className="form-group">
        <label htmlFor="contact-name" className="visually-hidden">
          Your Name (required)
        </label>
        <input
          type="text"
          id="contact-name"
          name="name"
          placeholder="Your Name *"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? "error" : ""}
          aria-required="true"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <span id="name-error" className="error-text" role="alert">
            {errors.name}
          </span>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="contact-email" className="visually-hidden">
          Your Email (required)
        </label>
        <input
          type="email"
          id="contact-email"
          name="email"
          placeholder="Your Email *"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "error" : ""}
          aria-required="true"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <span id="email-error" className="error-text" role="alert">
            {errors.email}
          </span>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="contact-message" className="visually-hidden">
          Your Message (required)
        </label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Your Message *"
          rows="3"
          value={formData.message}
          onChange={handleChange}
          className={errors.message ? "error" : ""}
          aria-required="true"
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "message-error" : undefined}
        ></textarea>
        {errors.message && (
          <span id="message-error" className="error-text" role="alert">
            {errors.message}
          </span>
        )}
      </div>
      <button type="submit" className="btn btn-primary">
        Send Message
      </button>
    </form>
  );
};

const Footer = () => {
  const { pathname } = useLocation();

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
	                <LogoWordmark />
	              </div>
              <p className="footer-tagline">
                Celebrating diversity, fostering community, and creating spaces
                where everyone belongs.
              </p>
            </div>

            <div className="footer-contact">
              <h3 id="contact-heading">Get In Touch</h3>
              <ContactForm key={pathname} />
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>
            © {new Date().getFullYear()} A Life Worth Celebrating, Inc. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
