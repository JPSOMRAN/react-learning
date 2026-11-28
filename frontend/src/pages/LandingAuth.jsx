import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../css/LandingAuth.css";

const MARVEL_COLLAGE_URL =
  "https://wallpapercave.com/wp/wp15528804.jpg";

function LandingAuth() {
  const { login, skipLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authMode, setAuthMode] = useState("hero"); // "hero" | "signin" | "signup"
  const [error, setError] = useState("");

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setAuthMode("signup");
  };

  const handleSubmitAuth = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setError("");
    login(email, password, name);
  };

  return (
    <div className="landing-wrapper">
      {/* Marvel Collage Backdrop + Growing Dark Shade */}
      <div className="collage-backdrop" aria-hidden="true">
        <img
          src={MARVEL_COLLAGE_URL}
          alt=""
          referrerPolicy="no-referrer"
          className="collage-img"
        />
      </div>
      <div className="landing-vignette" />

      {/* Top Bar */}
      <header className="landing-header">
        <div className="landing-logo">
          Stream<span>Heim</span>
        </div>

        <div className="landing-header-actions">
          <button
            type="button"
            className="skip-login-top-btn"
            onClick={skipLogin}
          >
            Skip Login
          </button>
          <button
            type="button"
            className="signin-top-btn"
            onClick={() => {
              setError("");
              setAuthMode(authMode === "signin" ? "hero" : "signin");
            }}
          >
            {authMode === "signin" ? "Back" : "Sign In"}
          </button>
        </div>
      </header>

      {/* Center Hero OR Sign-In / Sign-Up Card */}
      <main className="landing-center">
        {authMode === "hero" ? (
          <div className="landing-hero-box">
            <h1>Unlimited movies, free classics, and global cinema</h1>
            <p className="landing-sub">
              Watch official free releases &amp; public-domain films ad-free, or
              track your favourites across every OTT platform.
            </p>
            <p className="landing-prompt">
              Ready to watch? Enter your email to create or access your watchlist.
            </p>

            <form onSubmit={handleGetStarted} className="get-started-form">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="landing-email-input"
              />
              <button type="submit" className="get-started-btn">
                Get Started <span>›</span>
              </button>
            </form>

            {error && <p className="landing-error">{error}</p>}

            <div className="skip-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="skip-hero-btn"
              onClick={skipLogin}
            >
              Skip Login &amp; Browse Free →
            </button>
          </div>
        ) : (
          <div className="auth-card">
            <h2>{authMode === "signin" ? "Sign In" : "Create Account"}</h2>
            <form onSubmit={handleSubmitAuth} className="auth-card-form">
              {authMode === "signup" && (
                <input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
              />

              {error && <p className="landing-error">{error}</p>}

              <button type="submit" className="auth-submit-btn">
                {authMode === "signin" ? "Sign In" : "Finish & Start Watching"}
              </button>
            </form>

            <div className="auth-card-footer">
              {authMode === "signin" ? (
                <p>
                  New to StreamHeim?{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setAuthMode("signup")}
                  >
                    Sign up now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setAuthMode("signin")}
                  >
                    Sign in
                  </button>
                </p>
              )}

              <button
                type="button"
                className="skip-card-btn"
                onClick={skipLogin}
              >
                Skip Login for Now →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Curved Crimson Glow Arc */}
      <div className="landing-curve-divider" />
    </div>
  );
}

export default LandingAuth;