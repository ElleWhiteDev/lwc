const GRAPH_URL = "https://graph.facebook.com/v26.0";
const TIMEOUT_MS = 10_000;

export class GraphError extends Error {
  constructor({ message, code, error_subcode, type }) {
    super(message);
    this.name = "GraphError";
    this.code = code;
    this.subcode = error_subcode;
    this.type = type;
  }
}

// Token goes in a header rather than the query string so it never lands in URLs or logs
export async function graphGet(path, params, accessToken) {
  const res = await fetch(`${GRAPH_URL}/${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json();
  if (data.error) throw new GraphError(data.error);
  return data;
}
