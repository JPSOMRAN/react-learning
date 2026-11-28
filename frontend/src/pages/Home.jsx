import MovieCard from "../Components/MovieCard";
import MovieModal from "../Components/MovieModal";
import { useState, useEffect } from "react";
import { searchMovies, getMoviesByCategory } from "../services/api";
import "../css/Home.css";

const CATEGORIES = [
  { id: "popular", label: "Popular" },
  { id: "trending", label: "Trending" },
  { id: "top_rated", label: "Top Rated" },
  { id: "indian", label: "Indian" },
  { id: "korean", label: "Korean" },
  { id: "japanese", label: "Japanese" },
  { id: "chinese", label: "Chinese" },
  { id: "western", label: "Western" },
];

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("popular");
  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchQuery.trim()) return;

    const loadCategoryMovies = async () => {
      setLoading(true);
      try {
        const results = await getMoviesByCategory(activeCategory);
        setMovies(results);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load movies...");
      } finally {
        setLoading(false);
      }
    };

    loadCategoryMovies();
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await searchMovies(searchQuery);
        setMovies(searchResults);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to search movies...");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const searchResults = await searchMovies(searchQuery);
      setMovies(searchResults);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to search movies...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for movies..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>

      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill ${activeCategory === cat.id && !searchQuery ? "active" : ""}`}
            onClick={() => {
              setSearchQuery("");
              setActiveCategory(cat.id);
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard
              movie={movie}
              key={movie.id}
              onSelect={(id) => setSelectedMovieId(id)}
            />
          ))}
        </div>
      )}

      {selectedMovieId && (
        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </div>
  );
}

export default Home;