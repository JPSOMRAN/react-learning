function MovieCard({ movie }) {
  // movie is prop in {} braces
  function onFavoriteClick() {
    alert("clicked");
  }

  return (
    <div className="movie-card">
      <div className="movie-poster">
        <img src={movie.url} alt={movie.title} />
        <div className="movie-overlay">
          <button className="favorite-btn" onClick={onFavoriteClick}>
            ♡
          </button>
          {/* Favorite heart icon goes here */}
        </div>
      </div>
      <div className="movie-info">
         <h3>{movie.title}</h3>
         <p>{movie.release_date}</p>
      </div>
    </div>
  );
}

export default MovieCard;