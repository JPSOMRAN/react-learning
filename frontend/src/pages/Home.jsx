import MovieCard from "../Components/MovieCard";
import MovieModal from "../Components/MovieModal";
import { useState, useEffect } from "react";
import { searchMovies, getMoviesByCategory } from "../services/api";
import "../css/Home.css";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "web_series", label: "Web Series" },
  { id: "popular", label: "Popular" },
  { id: "indian", label: "Indian" },
  { id: "free", label: "Free & Ad-Supported" },
  { id: "hollywood", label: "Hollywood" },
  { id: "asian", label: "Asian" },
  { id: "trending", label: "Trending" },
 // { id: "yet_to_come", label: "Yet to Come" },
];

const REGIONAL_IDS = new Set(["indian", "hollywood", "asian"]);

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [movies, setMovies] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reset to default Home ("All") when StreamHeim logo or Home link is clicked
  useEffect(() => {
    const onResetHome = () => {
      setSearchQuery("");
      setActiveCategory("all");
      setSelectedItem(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("streamheim:reset-home", onResetHome);
    return () => window.removeEventListener("streamheim:reset-home", onResetHome);
  }, []);

  // Load category movies/series when search box is empty
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
        setError("Failed to load titles...");
      } finally {
        setLoading(false);
      }
    };

    loadCategoryMovies();
  }, [activeCategory, searchQuery]);

  // Search titles (scoped to activeCategory when a regional filter is active)
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await searchMovies(searchQuery, activeCategory);
        setMovies(searchResults);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to search titles...");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const searchResults = await searchMovies(searchQuery, activeCategory);
      setMovies(searchResults);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to search titles...");
    } finally {
      setLoading(false);
    }
  };

  const activeLabel = CATEGORIES.find((c) => c.id === activeCategory)?.label;
  const isRegional = REGIONAL_IDS.has(activeCategory);

  return (
    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder={
            isRegional
              ? `Search ${activeLabel} movies...`
              : "Search movies & web series..."
          }
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
            className={`category-pill ${
              activeCategory === cat.id && (!searchQuery.trim() || REGIONAL_IDS.has(cat.id))
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveCategory(cat.id);
              if (!REGIONAL_IDS.has(cat.id)) {
                setSearchQuery("");
              }
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : movies.length === 0 ? (
        <div className="loading">
          No {isRegional ? `${activeLabel} ` : ""}titles found for "{searchQuery}".
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((item) => (
            <MovieCard
              movie={item}
              key={`${item.media_type || "movie"}-${item.id}`}
              onSelect={(id) =>
                setSelectedItem({
                  id,
                  mediaType: item.media_type || "movie",
                })
              }
            />
          ))}
        </div>
      )}

      {selectedItem && (
        <MovieModal
          movieId={selectedItem.id}
          mediaType={selectedItem.mediaType}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default Home;