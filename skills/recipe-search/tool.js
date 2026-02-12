/**
 * Recipe Search Tool
 * Searches the web for recipes using Brave Search API.
 * Requires BRAVE_API_KEY environment variable.
 */

const BRAVE_API = "https://api.search.brave.com/res/v1/web/search";

async function search_recipes({ query, dietary, max_time }) {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    throw new Error("BRAVE_API_KEY environment variable is required");
  }

  let searchQuery = `recipe ${query}`;
  if (dietary) searchQuery += ` ${dietary}`;
  if (max_time) searchQuery += ` under ${max_time} minutes`;

  const url = `${BRAVE_API}?q=${encodeURIComponent(searchQuery)}&count=5`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!res.ok) throw new Error(`Search API error: ${res.status}`);

  const data = await res.json();
  const results = (data.web?.results || []).map((r) => ({
    title: r.title,
    url: r.url,
    description: r.description,
  }));

  return { type: "recipe_results", query, dietary, results };
}

async function recipe_detail({ url }) {
  return {
    type: "recipe_detail",
    url,
    note: "AI will fetch and parse the recipe page for ingredients and instructions.",
  };
}

module.exports = { search_recipes, recipe_detail };
