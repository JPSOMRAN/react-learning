const API_KEY = "743ec2f70d160e061433edac4bad6506";
const BASE_URL = "https://api.themoviedb.org/3";

export const getMoviesByCategory = async (category = "popular") => {
  let endpoint = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;

  if (category === "trending") {
    endpoint = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
  } else if (category === "top_rated") {
    endpoint = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`;
  } else if (category === "upcoming") {
    endpoint = `${BASE_URL}/movie/upcoming?api_key=${API_KEY}`;
  } else if (category === "indian") {
    endpoint = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=IN&sort_by=popularity.desc`;
  } else if (category === "korean") {
    endpoint = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=KR&sort_by=popularity.desc`;
  } else if (category === "japanese") {
    endpoint = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=JP&sort_by=popularity.desc`;
  } else if (category === "chinese") {
    endpoint = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=CN|HK&sort_by=popularity.desc`;
  } else if (category === "western") {
    endpoint = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=US|GB&sort_by=popularity.desc`;
  }

  const response = await fetch(endpoint);
  const data = await response.json();
  return data.results || [];
};

export const searchMovies = async (query) => {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.results || [];
};

export const getMovieDetails = async (movieId) => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits,watch/providers`
  );
  return await response.json();
};

export const getPopularMovies = () => getMoviesByCategory("popular");