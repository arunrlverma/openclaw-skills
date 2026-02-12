/**
 * Web Search Tool
 * Searches the web using Brave Search API.
 * Requires BRAVE_API_KEY environment variable.
 */

const BRAVE_API = "https://api.search.brave.com/res/v1/web/search";

async function search({ query, count = 5 }) {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    throw new Error("BRAVE_API_KEY environment variable is required");
  }

  const url = `${BRAVE_API}?q=${encodeURIComponent(query)}&count=${count}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`Brave Search API error: ${res.status}`);
  }

  const data = await res.json();
  const results = (data.web?.results || []).map((r) => ({
    title: r.title,
    url: r.url,
    description: r.description,
  }));

  return { type: "search_results", query, results };
}

module.exports = { search };
