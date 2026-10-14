const CHANNEL_ID = "UCQFWU-KjK3leY4AjfRDPbIQ";
const SOURCE_URL = `https://socialcounts.org/youtube-channel-analytics/${CHANNEL_ID}`;
const CACHE_URL = "https://cache.internal/subscribers";
const CACHE_TTL = 1800;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36";

const parseCount = (html) => {
  const faq =
    /"acceptedAnswer":\{"@type":"Answer","text":"[^"]*?\bhas\s+([\d][\d,]*)\s+subscribers/i.exec(html);
  const loose = /([\d]{1,3}(?:,\d{3})+|\d{4,7})\s+subscribers\b/i.exec(html);
  const match = faq || loose;
  if (!match) return 0;
  const value = parseInt(match[1].replace(/\D/g, ""), 10);
  return Number.isFinite(value) ? value : 0;
};

const fetchCount = async () => {
  const res = await fetch(SOURCE_URL, {
    headers: { "user-agent": UA, accept: "text/html" },
    signal: AbortSignal.timeout(8000),
    cf: { cacheTtl: CACHE_TTL, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`source status ${res.status}`);
  return parseCount(await res.text());
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=600",
    },
  });

export const onRequestGet = async () => {
  let cache;
  try {
    cache = caches.default;
    const hit = await cache.match(CACHE_URL);
    if (hit) return hit;
  } catch (e) {
    cache = null;
  }

  let subscribers = 0;
  try {
    subscribers = await fetchCount();
  } catch (e) {
    subscribers = 0;
  }

  const res = json({
    subscribers,
    source: subscribers ? "socialcounts" : "unavailable",
    updated: Date.now(),
  });

  if (cache && subscribers) {
    try {
      await cache.put(CACHE_URL, res.clone());
    } catch (e) {}
  }

  return res;
};
