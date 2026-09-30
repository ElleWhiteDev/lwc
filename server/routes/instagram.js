import { graphGet } from "../utils/metaGraph.js";
import { createFeedRouter } from "../utils/socialFeed.js";

const MEDIA_FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

async function fetchPosts(userId, accessToken) {
  const { data = [] } = await graphGet(
    `${encodeURIComponent(userId)}/media`,
    { fields: MEDIA_FIELDS, limit: 100 },
    accessToken,
  );
  return data.filter((p) => p.caption);
}

export default createFeedRouter({
  name: "Instagram",
  credentials: (c) => (c.instagramUserId && c.instagramAccessToken
    ? [c.instagramUserId, c.instagramAccessToken]
    : null),
  fetchPosts,
});
