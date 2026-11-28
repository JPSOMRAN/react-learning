import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/NavBar.css";

function NavBar() {
  const { user, logout } = useAuth();

  const handleResetHome = () => {
    window.dispatchEvent(new Event("streamheim:reset-home"));
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={handleResetHome}>
          Stream<span className="brand-accent">Heim</span>
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link" onClick={handleResetHome}>
          Home
        </Link>
        <Link to="/favourites" className="nav-link">
          Favourites
        </Link>

        {user ? (
          <button
            type="button"
            onClick={logout}
            className="nav-auth-btn"
            title={`Signed in as ${user.email}`}
          >
            {user.name} • Sign Out
          </button>
        ) : (
          <button
            type="button"
            onClick={logout}
            className="nav-auth-btn signin"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;