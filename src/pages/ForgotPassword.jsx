import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      setMessage(data.message);
      setEmail(""); // Clear the form
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <h1>Forgot Password</h1>
        <p style={{ marginBottom: "var(--spacing-lg)", color: "rgba(255, 255, 255, 0.9)", textAlign: "center" }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div
            style={{
              background: "#d4edda",
              border: "1px solid #c3e6cb",
              color: "#155724",
              padding: "var(--spacing-md)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--spacing-lg)",
            }}
            role="alert"
          >
            {message}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="your.email@example.com"
            />
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={{ marginTop: "var(--spacing-lg)", textAlign: "center" }}>
          <Link
            to="/login"
            style={{
              color: "var(--color-primary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
