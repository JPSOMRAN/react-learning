const API_KEY = "743ec2f70d160e061433edac4bad6506";
const BASE_URL = "https://api.themoviedb.org/3";
const YOUTUBE_API_KEY = "AIzaSyBSRdoGTg_3QHf3LI0eOjr_ekN5Q86rKCs";

const OFFICIAL_DISTRIBUTOR_KEYWORDS = [
  "goldmines",
  "yrf",
  "yash raj",
  "dharma productions",
  "red chillies",
  "shemaroo",
  "rajshri",
  "pen movies",
  "ultra movie",
  "eros now",
  "t-series",
  "aditya movies",
  "geetha arts",
  "sri balaji",
  "volga video",
  "youtube movies",
  "shout! studios",
  "shout factory",
  "popcornflix",
  "korean classic film",
  "gundaminfo",
  "tms official",
  "tsuburaya",
  "tvf",
  "the viral fever",
  "dice media",
  "pocket films",
  "timeliners",
  "filtercopy",
];

const INDIAN_LANGUAGES = "hi|te|ta|ml|kn|bn|mr|pa|or|gu";

const REGION_COUNTRIES = {
  // All Asia: South Asia, East Asia, Middle East/West Asia, and Southeast Asia
  asian:
    "IN|KR|JP|CN|HK|TW|TR|AE|SA|IR|LB|JO|KW|QA|PK|BD|LK|TH|ID|PH|VN|MY|SG",
  // Western: North America + Europe
  western: "US|CA|GB|FR|DE|IT|ES|SE|DK|NO|NL|PL|IE|BE|CH|AT|PT",
  // Hollywood: North American studio cinema
  hollywood: "US|CA",
  // Latin / South America
  latino: "MX|BR|AR|CO|CL|PE|VE|UY|EC|BO|PY|CU|DO|PR",
  // Africa
  african: "NG|ZA|EG|KE|GH|MA|TN|ET|SN|DZ",
};

const REGION_LANGUAGES = {
  indian: ["hi", "te", "ta", "ml", "kn", "bn", "mr", "pa", "or", "gu"],
  hollywood: ["en"],
  asian: [
    "hi", "te", "ta", "ml", "kn", "bn", "mr", "pa", "or", "gu",
    "ko", "ja", "zh", "cn",
    "tr", "ar", "fa", "ur",
    "th", "id", "tl", "vi", "ms",
  ],
  western: ["en", "fr", "de", "it", "es", "sv", "da", "no", "nl", "pl", "pt"],
  latino: ["es", "pt"],
  african: ["yo", "ig", "ha", "zu", "xh", "af", "sw", "am", "ar", "fr", "en"],
};

function isOfficialDistributorChannel(channelTitle = "") {
  const lower = channelTitle.toLowerCase();
  return OFFICIAL_DISTRIBUTOR_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function parseDurationMinutes(isoDuration = "") {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return Number(match[1] || 0) * 60 + Number(match[2] || 0);
}

function normalizeItem(item, fallbackType = "movie") {
  const media_type = item.media_type || fallbackType;
  return {
    ...item,
    media_type,
    title: item.title || item.name,
    original_title: item.original_title || item.original_name,
    release_date: item.release_date || item.first_air_date,
  };
}

export const getMoviesByCategory = async (category = "all") => {
  // 1. ALL -> Global blend across Asian, Indian, European, North/South American, and African cinema
  if (category === "all") {
    const [globalPop, asianPop, westernPop, latinoPop, africanPop] = await Promise.all([
      fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`).then((r) => r.json()),
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${REGION_COUNTRIES.asian}&sort_by=popularity.desc&page=1`).then((r) => r.json()),
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${REGION_COUNTRIES.western}&sort_by=popularity.desc&page=1`).then((r) => r.json()),
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${REGION_COUNTRIES.latino}&sort_by=popularity.desc&page=1`).then((r) => r.json()),
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${REGION_COUNTRIES.african}&sort_by=popularity.desc&page=1`).then((r) => r.json()),
    ]);

    const combined = [
      ...(globalPop.results || []).slice(0, 6),
      ...(asianPop.results || []).slice(0, 5),
      ...(westernPop.results || []).slice(0, 4),
      ...(latinoPop.results || []).slice(0, 3),
      ...(africanPop.results || []).slice(0, 3),
    ].map((m) => normalizeItem(m, "movie"));

    const unique = Array.from(new Map(combined.map((m) => [m.id, m])).values());
    return unique.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  // 2. WEB SERIES
  if (category === "web_series") {
    const [freeTvRes, trendingTvRes] = await Promise.all([
      fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&watch_region=IN&with_watch_monetization_types=free|ads&sort_by=popularity.desc`).then((r) => r.json()),
      fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`).then((r) => r.json()),
    ]);
    const combined = [...(freeTvRes.results || []), ...(trendingTvRes.results || [])];
    return Array.from(new Map(combined.map((s) => [s.id, normalizeItem(s, "tv")])).values());
  }

  // 3. POPULAR
  if (category === "popular") {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`);
    const data = await response.json();
    return (data.results || []).map((m) => normalizeItem(m, "movie"));
  }

  // 4. INDIAN (Strictly Indian origin country + Indian original languages)
  if (category === "indian") {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=IN&with_original_language=${INDIAN_LANGUAGES}&sort_by=popularity.desc`
    );
    const data = await response.json();
    return (data.results || []).map((m) => normalizeItem(m, "movie"));
  }

  // 5. FREE & AD-SUPPORTED (Movies + Web Series)
  if (category === "free") {
    const [freeMovies, freeSeries] = await Promise.all([
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&watch_region=IN&with_watch_monetization_types=free|ads&sort_by=popularity.desc`).then((r) => r.json()),
      fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&watch_region=IN&with_watch_monetization_types=free|ads&sort_by=popularity.desc`).then((r) => r.json()),
    ]);
    const merged = [
      ...(freeMovies.results || []).map((m) => normalizeItem(m, "movie")),
      ...(freeSeries.results || []).map((s) => normalizeItem(s, "tv")),
    ];
    return merged.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  // 6. HOLLYWOOD
  if (category === "hollywood") {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${REGION_COUNTRIES.hollywood}&with_original_language=en&sort_by=popularity.desc`
    );
    const data = await response.json();
    return (data.results || []).map((m) => normalizeItem(m, "movie"));
  }

  // 7. ASIAN (Indian + East Asian + Arab/Turkish/Middle East + SE Asian)
  if (category === "asian") {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${REGION_COUNTRIES.asian}&sort_by=popularity.desc`
    );
    const data = await response.json();
    return (data.results || []).map((m) => normalizeItem(m, "movie"));
  }

  // 8. TRENDING
  if (category === "trending") {
    const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
    const data = await response.json();
    return (data.results || []).map((m) => normalizeItem(m, "movie"));
  }

  // 9. YET TO COME (Upcoming releases)
  if (category === "yet_to_come") {
    const [upcomingIn, upcomingGlobal] = await Promise.all([
      fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&region=IN&page=1`).then((r) => r.json()),
      fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=1`).then((r) => r.json()),
    ]);
    const merged = [...(upcomingIn.results || []), ...(upcomingGlobal.results || [])].map((m) =>
      normalizeItem(m, "movie")
    );
    return Array.from(new Map(merged.map((m) => [m.id, m])).values());
  }

  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await response.json();
  return (data.results || []).map((m) => normalizeItem(m, "movie"));
};

export const searchMovies = async (query, category = "all") => {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const langs = REGION_LANGUAGES[category];
  const countries = REGION_COUNTRIES[category];

  const urls = [
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(cleanQuery)}&page=1`,
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(cleanQuery)}&page=1`,
  ];

  if (category === "web_series") {
    urls.push(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=1`);
  } else if (category === "indian") {
    urls.push(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=IN&with_original_language=${INDIAN_LANGUAGES}&sort_by=popularity.desc&page=1`
    );
  } else if (countries) {
    urls.push(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${countries}&sort_by=popularity.desc&page=1`
    );
  } else {
    urls.push(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`);
  }

  const responses = await Promise.all(urls.map((url) => fetch(url).then((r) => r.json())));
  const combined = responses.flatMap((d, idx) =>
    (d.results || []).map((item) => normalizeItem(item, idx === 1 ? "tv" : "movie"))
  );

  const unique = Array.from(
    new Map(combined.map((item) => [`${item.media_type}-${item.id}`, item])).values()
  );

  const matched = unique.filter((item) => {
    if (category === "web_series" && item.media_type !== "tv") return false;

    const title = (item.title || "").toLowerCase();
    const origTitle = (item.original_title || "").toLowerCase();
    if (!title.includes(cleanQuery) && !origTitle.includes(cleanQuery)) return false;

    if (!langs) return true;
    return langs.includes(item.original_language);
  });

  return matched.sort((a, b) => {
    const aHasPoster = a.poster_path ? 1 : 0;
    const bHasPoster = b.poster_path ? 1 : 0;
    if (bHasPoster !== aHasPoster) return bHasPoster - aHasPoster;
    return (b.popularity || 0) - (a.popularity || 0);
  });
};

export const getMovieDetails = async (id, mediaType = "movie") => {
  const response = await fetch(
    `${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=videos,credits,watch/providers`
  );
  const data = await response.json();
  return normalizeItem(data, mediaType);
};

export const getSeasonEpisodes = async (tvId, seasonNumber = 1) => {
  const response = await fetch(
    `${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data.episodes || [];
};

export const searchPublicDomainMp4 = async (title, year) => {
  try {
    const yearFilter = year ? ` AND year:(${year})` : "";
    const query = encodeURIComponent(
      `title:("${title}")${yearFilter} AND mediatype:(movies) AND collection:(feature_films)`
    );
    const searchRes = await fetch(
      `https://archive.org/advancedsearch.php?q=${query}&fl[]=identifier,title,year&sort[]=downloads+desc&rows=3&output=json`
    );
    const searchData = await searchRes.json();
    const doc = searchData?.response?.docs?.[0];
    if (!doc?.identifier) return null;

    const metaRes = await fetch(`https://archive.org/metadata/${doc.identifier}`);
    const metaData = await metaRes.json();

    const mp4Files = (metaData?.files || [])
      .filter((f) => f.name?.endsWith(".mp4") && Number(f.height) >= 480)
      .map((f) => {
        const h = Number(f.height);
        const label = h >= 2160 ? "2160p" : h >= 1080 ? "1080p" : h >= 720 ? "720p" : "480p";
        return {
          height: h,
          label,
          url: `https://archive.org/download/${doc.identifier}/${encodeURIComponent(f.name)}`,
        };
      })
      .sort((a, b) => b.height - a.height);

    const uniqueQualities = [];
    const seen = new Set();
    for (const item of mp4Files) {
      if (!seen.has(item.label)) {
        seen.add(item.label);
        uniqueQualities.push(item);
      }
    }

    if (uniqueQualities.length === 0) return null;

    const cappedStart =
      uniqueQualities.find((q) => q.height <= 1080) || uniqueQualities[uniqueQualities.length - 1];

    return {
      defaultUrl: cappedStart.url,
      defaultLabel: cappedStart.label,
      qualities: uniqueQualities,
    };
  } catch {
    return null;
  }
};

export const searchFullMovieOnYouTube = async (title, year, isSeriesEpisode = false) => {
  try {
    const suffix = isSeriesEpisode ? "full episode" : `${year} full movie`;
    const q = encodeURIComponent(`${title} ${suffix}`);
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=long&videoDefinition=high&videoEmbeddable=true&maxResults=5&q=${q}&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchRes.json();
    const items = searchData.items || [];
    if (items.length === 0) return null;

    const ids = items.map((item) => item.id.videoId).join(",");
    const detailsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${ids}&key=${YOUTUBE_API_KEY}`
    );
    const detailsData = await detailsRes.json();

    const minMinutes = isSeriesEpisode ? 12 : 60;
    const baseTitle = title.split(" - ")[0].toLowerCase();

    const verifiedOfficial = (detailsData.items || []).find((video) => {
      const channelTitle = video.snippet?.channelTitle || "";
      const videoTitle = (video.snippet?.title || "").toLowerCase();
      const minutes = parseDurationMinutes(video.contentDetails?.duration);
      const isCreativeCommons = video.status?.license === "creativeCommon";
      const isStudio = isOfficialDistributorChannel(channelTitle);

      return (
        videoTitle.includes(baseTitle) &&
        minutes >= minMinutes &&
        (isStudio || isCreativeCommons)
      );
    });

    if (!verifiedOfficial) return null;

    return {
      videoId: verifiedOfficial.id,
      distributor: verifiedOfficial.snippet?.channelTitle,
    };
  } catch {
    return null;
  }
};

export const getPopularMovies = () => getMoviesByCategory("all");