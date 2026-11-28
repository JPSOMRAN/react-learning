import { useEffect, useState } from "react";
import { getMovieDetails } from "../services/api";
import "../css/MovieModal.css";

function MovieModal({ movieId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getMovieDetails(movieId);
        setDetails(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [movieId]);

  if (!movieId) return null;

  const trailer =
    details?.videos?.results?.find(
      (vid) => vid.site === "YouTube" && vid.type === "Trailer"
    ) ||
    details?.videos?.results?.find((vid) => vid.site === "YouTube");

  const providersData =
    details?.["watch/providers"]?.results?.IN ||
    details?.["watch/providers"]?.results?.US;

  const freeProviders = [
    ...(providersData?.free || []),
    ...(providersData?.ads || []),
  ];
  const streamProviders = providersData?.flatrate || [];
  const rentProviders = providersData?.rent || [];

  const releaseYear = details?.release_date?.split("-")[0] || "";
  const youtubeFullMovieUrl = details
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${details.title} ${releaseYear} full movie`
      )}`
    : "#";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {loading || !details ? (
          <div className="modal-loading">Loading trailer & details...</div>
        ) : (
          <>
            {trailer ? (
              <div className="trailer-wrapper">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                  title={details.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : (
              details.backdrop_path && (
                <img
                  className="modal-backdrop-img"
                  src={`https://image.tmdb.org/t/p/w1280${details.backdrop_path}`}
                  alt={details.title}
                />
              )
            )}

            <div className="modal-body">
              <h2>{details.title}</h2>
              <div className="modal-meta">
                <span className="rating-pill">
                  ★ {details.vote_average?.toFixed(1)}
                </span>
                <span>{releaseYear}</span>
                {details.runtime > 0 && <span>{details.runtime} min</span>}
                <span>{details.genres?.map((g) => g.name).join(" • ")}</span>
              </div>

              <p className="modal-overview">{details.overview}</p>

              {/* Where to Watch: Free YouTube + Free/Paid OTT */}
              <div className="modal-section">
                <div className="watch-header">
                  <h4>Where to Watch</h4>
                  <a
                    href={youtubeFullMovieUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="youtube-watch-btn"
                  >
                    ▶ Check Free on YouTube
                  </a>
                </div>

                {freeProviders.length > 0 && (
                  <div className="providers-list" style={{ marginBottom: "0.75rem" }}>
                    {freeProviders.map((provider) => (
                      <div key={provider.provider_id} className="provider-chip free-chip">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                        />
                        <span>{provider.provider_name} (Free)</span>
                      </div>
                    ))}
                  </div>
                )}

                {streamProviders.length > 0 ? (
                  <div className="providers-list">
                    {streamProviders.map((provider) => (
                      <div key={provider.provider_id} className="provider-chip">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                        />
                        <span>{provider.provider_name}</span>
                      </div>
                    ))}
                  </div>
                ) : rentProviders.length > 0 ? (
                  <div className="providers-list">
                    {rentProviders.map((provider) => (
                      <div key={provider.provider_id} className="provider-chip">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                        />
                        <span>{provider.provider_name} (Rent)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  freeProviders.length === 0 && (
                    <p className="not-streaming">
                      Not listed on subscription OTT yet — try the YouTube button above.
                    </p>
                  )
                )}
              </div>

              {/* Top Cast */}
              {details.credits?.cast?.length > 0 && (
                <div className="modal-section">
                  <h4>Top Cast</h4>
                  <div className="cast-grid">
                    {details.credits.cast.slice(0, 6).map((actor) => (
                      <div key={actor.id} className="cast-card">
                        <img
                          src={
                            actor.profile_path
                              ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                              : "https://via.placeholder.com/100x100?text=No+Photo"
                          }
                          alt={actor.name}
                        />
                        <span className="cast-name">{actor.name}</span>
                        <span className="cast-role">{actor.character}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MovieModal;