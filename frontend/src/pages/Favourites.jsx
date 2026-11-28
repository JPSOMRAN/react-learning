import { useState } from "react";
import "../css/Favourites.css";
import { useMovieContext } from "../context/MovieContext";
import MovieCard from "../Components/MovieCard";
import MovieModal from "../Components/MovieModal";

function Favourites() {
  const { favourites } = useMovieContext();
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  if (favourites && favourites.length > 0) {
    return (
      <div className="favourites">
        <h2>Your Favourites ({favourites.length})</h2>
        <div className="movies-grid">
          {favourites.map((movie) => (
            <MovieCard
              movie={movie}
              key={movie.id}
              onSelect={(id) => setSelectedMovieId(id)}
            />
          ))}
        </div>

        {selectedMovieId && (
          <MovieModal
            movieId={selectedMovieId}
            onClose={() => setSelectedMovieId(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="favourites-empty">
      <h2>No Favourite Movies Yet</h2>
      <p>Start adding movies to your favourites and they will appear here!</p>
    </div>
  );
}

export default Favourites;