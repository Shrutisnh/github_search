import axios from "axios";
import Constants from "expo-constants";

const GITHUB_TOKEN = Constants.manifest?.extra?.GITHUB_TOKEN || process.env.GITHUB_TOKEN;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const fetchRepositories = async (
  page,
  endPoint = "https://api.github.com/search/repositories",
  text = "",
  order = "asc"
) => {
  const maxRetries = 5;
  let attempt = 0;
  let lastErr;

  while (attempt < maxRetries) {
    try {
      const query = text || "nextjs";

      const requestParams = {
        params: {
          q: query,
          page,
          per_page: 10,
          sort: "stars",   // ✅ correct
          order,           // ✅ correct
        },
        headers: {
          Accept: "application/vnd.github+json",
          ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
        },
      };

      console.log("request::", {
        url: endPoint,
        params: requestParams.params,
        headers: requestParams.headers,
      });

      const res = await axios.get(endPoint, requestParams);

      console.log("response::", {
        status: res.status,
        firstRepo: res.data.items?.[0]?.full_name,
      });

      return res.data.items || [];
    } catch (err) {
      lastErr = err;
      const status = err.response?.status;
      const headers = err.response?.headers || {};

      if (status === 422) {
        throw new Error(
          err.response?.data?.message ||
          "Invalid GitHub search query"
        );
      }

      if (status === 403 || status === 429) {
        attempt++;
        const retryAfter =
          headers["retry-after"]
            ? parseInt(headers["retry-after"], 10) * 1000
            : Math.min(1000 * 2 ** attempt, 15000);

        await sleep(retryAfter);
        continue;
      }

      throw err;
    }
  }

  throw lastErr;
};

