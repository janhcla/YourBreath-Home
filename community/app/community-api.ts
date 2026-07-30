export type SessionState = {
  authenticated: boolean;
  anonymous: boolean;
  user: { id: string; displayName: string | null; role: "user" | "admin" } | null;
};

export type SuggestionResponse = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  votes: number;
  comments: number;
  submitted: string;
  author: string;
  developerResponse: string | null;
  isPinned: boolean;
  isShipped: boolean;
  version: string | null;
  availability: string | null;
  viewerVoted: boolean;
  viewerFollowed: boolean;
  commentsList?: { id: string; author: string; body: string; date: string }[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Community request failed");
  return data as T;
}

export function fetchSession() {
  return request<{ authenticated: boolean; anonymous: boolean; user: SessionState["user"] }>("/api/session");
}

export function fetchSuggestions(filters: { query?: string; category?: string; status?: string; sort?: string } = {}) {
  const search = new URLSearchParams();
  if (filters.query) search.set("q", filters.query);
  if (filters.category && filters.category !== "All categories") search.set("category", filters.category);
  if (filters.status && filters.status !== "All statuses") search.set("status", filters.status);
  if (filters.sort) search.set("sort", filters.sort);
  return request<{ suggestions: SuggestionResponse[] }>(`/api/suggestions?${search}`);
}

export function fetchSuggestion(id: string) {
  return request<{ suggestion: SuggestionResponse & { comments: SuggestionResponse["commentsList"] } }>(`/api/suggestions/${encodeURIComponent(id)}`);
}

export function fetchActivity() {
  return request<{ activity: { votes: { id: string }[]; follows: { id: string }[]; submissions: { id: string }[] } }>("/api/activity");
}

export function toggleVote(id: string) {
  return request<{ voted: boolean; votes: number }>("/api/votes/toggle", { method: "POST", body: JSON.stringify({ id }) });
}

export function toggleFollow(id: string) {
  return request<{ followed: boolean }>("/api/follows/toggle", { method: "POST", body: JSON.stringify({ id }) });
}

export function createSuggestion(input: { title: string; description: string; category: string }) {
  return request<{ id: string }>("/api/suggestions", { method: "POST", body: JSON.stringify(input) });
}

export function createComment(suggestionId: string, body: string) {
  return request<{ id: string }>("/api/comments", { method: "POST", body: JSON.stringify({ suggestionId, body }) });
}

export function signInWithApple(returnTo = window.location.pathname) {
  window.location.assign(`/api/auth/apple/start?return_to=${encodeURIComponent(returnTo)}`);
}

