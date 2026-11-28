/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("streamheim_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem("streamheim_guest") === "true";
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("streamheim_user", JSON.stringify(user));
      localStorage.removeItem("streamheim_guest");
    } else {
      localStorage.removeItem("streamheim_user");
    }
  }, [user]);

  const login = (email, password, name = "") => {
    const displayName = name.trim() || email.split("@")[0];
    setIsGuest(false);
    setUser({
      email,
      name: displayName,
      loggedInAt: new Date().toISOString(),
    });
  };

  const skipLogin = () => {
    setUser(null);
    setIsGuest(true);
    localStorage.setItem("streamheim_guest", "true");
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem("streamheim_user");
    localStorage.removeItem("streamheim_guest");
  };

  const hasEnteredApp = Boolean(user || isGuest);

  return (
    <AuthContext.Provider
      value={{ user, isGuest, hasEnteredApp, login, skipLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}