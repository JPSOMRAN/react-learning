import "./css/App.css";
import Favourites from "./pages/Favourites";
import Home from "./pages/Home";
import LandingAuth from "./pages/LandingAuth";
import { Routes, Route } from "react-router-dom";
import { MovieProvider } from "./context/MovieContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavBar from "./Components/NavBar";

function AppShell() {
  const { hasEnteredApp } = useAuth();

  if (!hasEnteredApp) {
    return <LandingAuth />;
  }

  return (
    <div>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favourites" element={<Favourites />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MovieProvider>
        <AppShell />
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;