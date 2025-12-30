import axios from "axios";
import Constants from "expo-constants";

const GITHUB_TOKEN = Constants.manifest?.extra?.GITHUB_TOKEN || process.env.GITHUB_TOKEN;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const fetchRepositories = async (
  page,
  endPoint = "https://api.github.com/search/repositories",
  text = ""
) => {
  const maxRetries = 5;
  let attempt = 0;
  let lastErr;

  while (attempt <= maxRetries) {
    try {
      const query = text ? text : 'nextjs';
      const res = await axios.get(endPoint, {
        params: {
          q: query,
          page: page,
          per_page: 10,
        },
        headers: {
          Accept: "application/vnd.github+json",
          ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
        },
      });
    //   console.log(`GitHub API response1:`+ JSON.stringify(res.data.items[0]));

      return res.data.items || [];
    } catch (err) {
      lastErr = err;
      const status = err.response?.status;
      const headers = err.response?.headers || {};
      const retryAfter = headers["retry-after"] ? parseInt(headers["retry-after"], 10) * 1000 : null;

      if (status === 422) {
        console.warn('GitHub API 422 Unprocessable Entity:', err.response?.data);
        throw new Error(`GitHub API 422: ${err.response?.data?.message || 'Invalid search query (q parameter). Provide a non-empty search term.'}`);
      }

      if (status === 429 || status === 403) {
        attempt += 1;
        if (attempt > maxRetries) break;

        const backoff = retryAfter ?? Math.min(1000 * 2 ** attempt, 15000) + Math.floor(Math.random() * 1000);
        console.warn(`GitHub rate limit (status ${status}). Retry ${attempt}/${maxRetries} in ${backoff}ms.`, {
          "x-ratelimit-remaining": headers["x-ratelimit-remaining"],
          "x-ratelimit-reset": headers["x-ratelimit-reset"],
          "retry-after": headers["retry-after"],
        });

        await sleep(backoff);
        continue;
      }

      throw err;
    }
  }

  if (lastErr?.response?.status === 429 || lastErr?.response?.status === 403) {
    throw new Error("GitHub rate limit reached. Consider adding an auth token or using a server-side cache/proxy.");
  }

  throw lastErr;
};
