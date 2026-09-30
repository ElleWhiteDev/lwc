import { graphGet } from "../utils/metaGraph.js";
import { createFeedRouter } from "../utils/socialFeed.js";

const POST_FIELDS = "message,created_time,full_picture,permalink_url";

// The saved token may be a user token; Page posts require a Page token, so exchange it once
// and reuse the result until the saved token changes or a request with it fails.
let pageToken = { source: null, token: null };

async function resolvePageToken(pageId, accessToken) {
  if (pageToken.source === accessToken) return pageToken.token;
  try {
    const { access_token } = await graphGet(pageId, { fields: "access_token" }, accessToken);
    if (access_token) {
      pageToken = { source: accessToken, token: access_token };
      return access_token;
    }
  } catch {
    // Already a Page token (or no Page access) — use it as-is and let the posts call report errors
  }
  return accessToken;
}

async function fetchPosts(pageId, accessToken) {
  const token = await resolvePageToken(pageId, accessToken);
  try {
    const { data = [] } = await graphGet(
      `${encodeURIComponent(pageId)}/posts`,
      // Graph rejects larger Page post requests with "Please reduce the amount of data"
      { fields: POST_FIELDS, limit: 25 },
      token,
    );
    return data.filter((p) => p.message);
  } catch (error) {
    pageToken = { source: null, token: null };
    throw error;
  }
}

export default createFeedRouter({
  name: "Facebook",
  credentials: (c) => (c.facebookPageId && c.facebookAccessToken
    ? [c.facebookPageId, c.facebookAccessToken]
    : null),
  fetchPosts,
});
