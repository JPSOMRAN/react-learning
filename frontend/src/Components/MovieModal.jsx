import { useEffect, useState } from "react";
import {
  getMovieDetails,
  searchPublicDomainMp4,
  searchFullMovieOnYouTube,
} from "../services/api";
import "../css/MovieModal.css";

function getProviderUrl(providerName, title, fallbackLink) {
  const encoded = encodeURIComponent(title);
  const name = providerName.toLowerCase();

  if (name.includes("netflix")) return `https://www.netflix.com/search?q=${encoded}`;
  if (name.includes("amazon") || name.includes("prime"))
    return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encoded}`;
  if (name.includes("hotstar") || name.includes("jio"))
    return `https://www.hotstar.com/in/explore?search_query=${encoded}`;
  if (name.includes("zee5")) return `https://www.zee5.com/search?q=${encoded}`;
  if (name.includes("sonyliv") || name.includes("sony"))
    return `https://www.sonyliv.com/search?q=${encoded}`;
  if (name.includes("apple")) return `https://tv.apple.com/search?term=${encoded}`;
  if (name.includes("youtube"))
    return `https://www.youtube.com/results?search_query=${encoded}+full+movie`;
  if (name.includes("crunchyroll"))
    return `https://www.crunchyroll.com/search?q=${encoded}`;

  return (
    fallbackLink ||
    `https://www.google.com/search?q=watch+${encoded}+on+${encodeURIComponent(providerName)}`
  );
}

function MovieModal({ movieId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publicStream, setPublicStream] = useState(null);
  const [selectedMp4Url, setSelectedMp4Url] = useState(null);
  const [fullYouTube, setFullYouTube] = useState(null);
  const [playMode, setPlayMode] = useState("trailer");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setPlayMode("trailer");
      setPublicStream(null);
      setSelectedMp4Url(null);
      setFullYouTube(null);

      try {
        const data = await getMovieDetails(movieId);
        setDetails(data);

        const year = data?.release_date?.split("-")[0] || "";
        const mp4 = await searchPublicDomainMp4(data.title, year);
        if (mp4) {
          setPublicStream(mp4);
          setSelectedMp4Url(mp4.defaultUrl);
        } else {
          const yt = await searchFullMovieOnYouTube(data.title, year);
          if (yt) setFullYouTube(yt);
        }
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

  const isFreeInApp = Boolean(publicStream || fullYouTube);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {loading || !details ? (
          <div className="modal-loading">Loading movie & availability...</div>
        ) : (
          <>
            {playMode === "full" && selectedMp4Url ? (
              <div className="trailer-wrapper">
                <video
                  key={selectedMp4Url}
                  src={selectedMp4Url}
                  controls
                  autoPlay
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000",
                  }}
                />
              </div>
            ) : playMode === "full" && fullYouTube ? (
              <div className="trailer-wrapper">
                <iframe
                  key={fullYouTube.videoId}
                  src={`https://www.youtube.com/embed/${fullYouTube.videoId}?autoplay=1&vq=hd1080`}
                  title={details.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : trailer ? (
              <div className="trailer-wrapper">
                <iframe
                  key={trailer.key}
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&vq=hd1080`}
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
              <div className="modal-title-row">
                <div>
                  <h2>{details.title}</h2>
                  {isFreeInApp && (
                    <span className="free-badge">
                      {publicStream
                        ? `● Free Public Domain (Starts in ${publicStream.defaultLabel})`
                        : `● Official Free Release via ${fullYouTube.distributor}`}
                    </span>
                  )}
                </div>

                <div className="player-toggle-group">
                  {trailer && (
                    <button
                      className={`mode-btn ${playMode === "trailer" ? "active" : ""}`}
                      onClick={() => setPlayMode("trailer")}
                    >
                      Trailer
                    </button>
                  )}
                  {isFreeInApp && (
                    <button
                      className={`youtube-watch-btn ${playMode === "full" ? "active" : ""}`}
                      onClick={() => setPlayMode("full")}
                    >
                      ▶ Watch Full Movie Free
                    </button>
                  )}
                  {playMode === "full" && publicStream?.qualities?.length > 1 && (
                    <select
                      className="quality-select"
                      value={selectedMp4Url}
                      onChange={(e) => setSelectedMp4Url(e.target.value)}
                      aria-label="Select video quality"
                    >
                      {publicStream.qualities.map((q) => (
                        <option key={q.label} value={q.url}>
                          {q.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="modal-meta">
                <span className="rating-pill">
                  ★ {details.vote_average?.toFixed(1)}
                </span>
                <span>{releaseYear}</span>
                {details.runtime > 0 && <span>{details.runtime} min</span>}
                <span>{details.genres?.map((g) => g.name).join(" • ")}</span>
              </div>

              <p className="modal-overview">{details.overview}</p>

              <div className="modal-section">
                <h4>Where to Watch</h4>

                {freeProviders.length > 0 && (
                  <div className="providers-list" style={{ marginBottom: "0.75rem" }}>
                    {freeProviders.map((provider) => (
                      <a
                        key={provider.provider_id}
                        href={getProviderUrl(
                          provider.provider_name,
                          details.title,
                          providersData?.link
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="provider-chip free-chip"
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                        />
                        <span>{provider.provider_name} (Free) ↗</span>
                      </a>
                    ))}
                  </div>
                )}

                {streamProviders.length > 0 ? (
                  <div className="providers-list">
                    {streamProviders.map((provider) => (
                      <a
                        key={provider.provider_id}
                        href={getProviderUrl(
                          provider.provider_name,
                          details.title,
                          providersData?.link
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="provider-chip"
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                        />
                        <span>{provider.provider_name} ↗</span>
                      </a>
                    ))}
                  </div>
                ) : rentProviders.length > 0 ? (
                  <div className="providers-list">
                    {rentProviders.map((provider) => (
                      <a
                        key={provider.provider_id}
                        href={getProviderUrl(
                          provider.provider_name,
                          details.title,
                          providersData?.link
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="provider-chip"
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                        />
                        <span>{provider.provider_name} (Rent) ↗</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  !isFreeInApp &&
                  freeProviders.length === 0 && (
                    <p className="not-streaming">
                      Not currently available on subscription OTT.
                    </p>
                  )
                )}
              </div>

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