import {
  CATEGORIES,
  hashToken,
  makeOpaqueId,
  parseCookies,
} from "./domain.mjs";
import type { Env, Identity, Profile, SuggestionInput, SuggestionRecord } from "./types";

const ANONYMOUS_COOKIE = "yb_anon";
const SESSION_COOKIE = "yb_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type Row = Record<string, unknown>;

async function first<T extends Row>(statement: D1PreparedStatement): Promise<T | null> {
  return (await statement.first<T>()) ?? null;
}

export function getCookieNames() {
  return { anonymous: ANONYMOUS_COOKIE, session: SESSION_COOKIE };
}

export function sessionCookieMaxAge() {
  return SESSION_MAX_AGE;
}

export async function loadIdentity(env: Env, request: Request): Promise<Identity> {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const sessionToken = cookies[SESSION_COOKIE] || null;
  if (sessionToken) {
    const session = await first<{ profile_id: string; anonymous_participant_id: string | null }>(
      env.DB.prepare(
        `SELECT profile_id, anonymous_participant_id FROM sessions
         WHERE id_hash = ? AND expires_at > CURRENT_TIMESTAMP`,
      ).bind(await hashToken(sessionToken)),
    );
    if (session) {
      const profile = await first<Profile>(
        env.DB.prepare(
          `SELECT id, display_name as displayName, email, role, apple_subject as appleSubject
           FROM profiles WHERE id = ?`,
        ).bind(session.profile_id),
      );
      if (profile) {
        await env.DB.prepare("UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id_hash = ?").bind(await hashToken(sessionToken)).run();
        return { profile, anonymousId: session.anonymous_participant_id, anonymousCookieValue: cookies[ANONYMOUS_COOKIE] ?? null, sessionToken, setAnonymousCookie: false };
      }
    }
  }

  const cookieId = cookies[ANONYMOUS_COOKIE] || makeOpaqueId();
  const anonymousId = await hashToken(cookieId);
  await env.DB.prepare(
    `INSERT INTO anonymous_participants (id) VALUES (?)
     ON CONFLICT(id) DO UPDATE SET last_seen_at = CURRENT_TIMESTAMP`,
  ).bind(anonymousId).run();
  return { profile: null, anonymousId, anonymousCookieValue: cookieId, sessionToken: null, setAnonymousCookie: !cookies[ANONYMOUS_COOKIE] };
}

function categoryId(category: string) {
  const id = CATEGORIES.find((name) => name === category)?.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-") ?? "other";
  return id;
}

function relativeDate(value: string) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return value;
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(time));
}

function toSuggestion(row: Row): SuggestionRecord {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    category: String(row.category),
    status: String(row.status),
    votes: Number(row.votes ?? 0),
    comments: Number(row.comments ?? 0),
    submitted: relativeDate(String(row.created_at)),
    author: String(row.author ?? "Community member"),
    developerResponse: row.developer_response ? String(row.developer_response) : null,
    isPinned: Boolean(row.is_pinned),
    isShipped: String(row.status) === "Shipped",
    version: row.shipped_version ? String(row.shipped_version) : null,
    availability: row.shipped_version ? `Available in YourBreath ${row.shipped_version}` : null,
    viewerVoted: Boolean(row.viewer_voted),
    viewerFollowed: Boolean(row.viewer_followed),
  };
}

export async function listSuggestions(env: Env, identity: Identity, filters: { query?: string; category?: string; status?: string; sort?: string } = {}) {
  const conditions = ["s.is_hidden = 0", "s.canonical_suggestion_id IS NULL"];
  const values: unknown[] = [identity.profile?.id ?? null, identity.anonymousId, identity.profile?.id ?? null];
  if (filters.query?.trim()) {
    conditions.push("(s.title LIKE ? OR s.description LIKE ?)");
    const query = `%${filters.query.trim().slice(0, 80)}%`;
    values.push(query, query);
  }
  if (filters.category && CATEGORIES.includes(filters.category)) {
    conditions.push("c.name = ?");
    values.push(filters.category);
  }
  if (filters.status && ["New", "Under review", "Planned", "In progress", "Shipped", "Not planned"].includes(filters.status)) {
    conditions.push("s.status = ?");
    values.push(filters.status);
  }
  const order = filters.sort === "Newest" ? "s.created_at DESC" : filters.sort === "Trending" ? "(COUNT(v.rowid) + CASE WHEN s.status = 'Under review' THEN 12 ELSE 0 END) DESC, s.updated_at DESC" : "COUNT(v.rowid) DESC, s.is_pinned DESC, s.updated_at DESC";
  const result = await env.DB.prepare(
    `SELECT s.id, s.title, s.description, s.status, s.developer_response, s.is_pinned,
       s.shipped_version, s.created_at,
       c.name as category,
       COALESCE(COUNT(DISTINCT v.rowid), 0) as votes,
       (SELECT COUNT(*) FROM comments cm WHERE cm.suggestion_id = s.id AND cm.is_hidden = 0) as comments,
       COALESCE(p.display_name, CASE WHEN s.status = 'Shipped' THEN 'YourBreath team' ELSE 'Community member' END) as author,
       EXISTS(SELECT 1 FROM votes vv WHERE vv.suggestion_id = s.id AND (vv.user_id = ? OR vv.anonymous_participant_id = ?)) as viewer_voted,
       EXISTS(SELECT 1 FROM follows ff WHERE ff.suggestion_id = s.id AND ff.user_id = ?) as viewer_followed
     FROM suggestions s
     JOIN categories c ON c.id = s.category_id
     LEFT JOIN votes v ON v.suggestion_id = s.id
     LEFT JOIN profiles p ON p.id = s.author_user_id
     WHERE ${conditions.join(" AND ")}
     GROUP BY s.id
     ORDER BY ${order}`,
  ).bind(...values).all<Row>();
  return result.results.map(toSuggestion);
}

export async function getSuggestion(env: Env, identity: Identity, id: string) {
  const suggestions = await listSuggestions(env, identity, {});
  const suggestion = suggestions.find((item) => item.id === id);
  if (!suggestion) return null;
  const comments = await env.DB.prepare(
    `SELECT cm.id, cm.body, cm.created_at, COALESCE(p.display_name, 'Community member') as author
     FROM comments cm JOIN profiles p ON p.id = cm.user_id
     WHERE cm.suggestion_id = ? AND cm.is_hidden = 0 ORDER BY cm.created_at ASC`,
  ).bind(id).all<Row>();
  return {
    ...suggestion,
    comments: comments.results.map((row) => ({ id: String(row.id), body: String(row.body), date: relativeDate(String(row.created_at)), author: String(row.author) })),
  };
}

export async function createSuggestion(env: Env, identity: Identity, input: SuggestionInput) {
  const id = makeOpaqueId();
  await env.DB.prepare(
    `INSERT INTO suggestions (id, author_user_id, anonymous_author_id, title, description, category_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).bind(id, identity.profile?.id ?? null, identity.profile ? null : identity.anonymousId, input.title, input.description, categoryId(input.category)).run();
  return id;
}

async function voteCount(env: Env, id: string) {
  const row = await first<{ count: number }>(env.DB.prepare("SELECT COUNT(*) as count FROM votes WHERE suggestion_id = ?").bind(id));
  return Number(row?.count ?? 0);
}

export async function toggleVote(env: Env, identity: Identity, id: string) {
  const existing = await first<{ id: string }>(env.DB.prepare(
    `SELECT rowid as id FROM votes WHERE suggestion_id = ? AND ((user_id = ? AND user_id IS NOT NULL) OR (anonymous_participant_id = ? AND anonymous_participant_id IS NOT NULL)) LIMIT 1`,
  ).bind(id, identity.profile?.id ?? null, identity.profile ? null : identity.anonymousId));
  let voted: boolean;
  if (existing) {
    await env.DB.prepare("DELETE FROM votes WHERE rowid = ?").bind(existing.id).run();
    voted = false;
  } else {
    await env.DB.prepare("INSERT OR IGNORE INTO votes (suggestion_id, user_id, anonymous_participant_id) VALUES (?, ?, ?)").bind(id, identity.profile?.id ?? null, identity.profile ? null : identity.anonymousId).run();
    voted = true;
  }
  return { voted, votes: await voteCount(env, id) };
}

export async function toggleFollow(env: Env, profileId: string, id: string) {
  const existing = await first<{ suggestion_id: string }>(env.DB.prepare("SELECT suggestion_id FROM follows WHERE suggestion_id = ? AND user_id = ?").bind(id, profileId));
  if (existing) await env.DB.prepare("DELETE FROM follows WHERE suggestion_id = ? AND user_id = ?").bind(id, profileId).run();
  else await env.DB.prepare("INSERT OR IGNORE INTO follows (suggestion_id, user_id) VALUES (?, ?)").bind(id, profileId).run();
  return { followed: !existing };
}

export async function createComment(env: Env, profileId: string, id: string, body: string) {
  const suggestion = await first<{ comments_locked: number; is_hidden: number }>(env.DB.prepare("SELECT comments_locked, is_hidden FROM suggestions WHERE id = ?").bind(id));
  if (!suggestion || suggestion.is_hidden || suggestion.comments_locked) return { ok: false as const, error: "Comments are closed for this idea" };
  const commentId = makeOpaqueId();
  await env.DB.prepare("INSERT INTO comments (id, suggestion_id, user_id, body) VALUES (?, ?, ?, ?)").bind(commentId, id, profileId, body).run();
  return { ok: true as const, id: commentId };
}

export async function createReport(env: Env, identity: Identity, target: { suggestionId?: string; commentId?: string; reason: string; details: string }) {
  const id = makeOpaqueId();
  await env.DB.prepare("INSERT INTO reports (id, suggestion_id, comment_id, reason, reporter_user_id) VALUES (?, ?, ?, ?, ?)").bind(id, target.suggestionId ?? null, target.commentId ?? null, `${target.reason}${target.details ? `: ${target.details}` : ""}`, identity.profile?.id ?? null).run();
  return id;
}

export async function getActivity(env: Env, identity: Identity) {
  const userId = identity.profile?.id ?? null;
  const anonymousId = identity.profile ? null : identity.anonymousId;
  const votes = await env.DB.prepare(
    `SELECT s.id, s.title FROM votes v JOIN suggestions s ON s.id = v.suggestion_id
     WHERE (v.user_id = ? AND v.user_id IS NOT NULL) OR (v.anonymous_participant_id = ? AND v.anonymous_participant_id IS NOT NULL)
     ORDER BY v.created_at DESC`,
  ).bind(userId, anonymousId).all<Row>();
  const follows = userId ? await env.DB.prepare(
    `SELECT s.id, s.title FROM follows f JOIN suggestions s ON s.id = f.suggestion_id WHERE f.user_id = ? ORDER BY f.created_at DESC`,
  ).bind(userId).all<Row>() : { results: [] as Row[] };
  const submissions = await env.DB.prepare(
    `SELECT id, title FROM suggestions WHERE (author_user_id = ? AND author_user_id IS NOT NULL) OR (anonymous_author_id = ? AND anonymous_author_id IS NOT NULL) ORDER BY created_at DESC`,
  ).bind(userId, anonymousId).all<Row>();
  return {
    votes: votes.results.map((row) => ({ id: String(row.id), title: String(row.title) })),
    follows: follows.results.map((row) => ({ id: String(row.id), title: String(row.title) })),
    submissions: submissions.results.map((row) => ({ id: String(row.id), title: String(row.title) })),
  };
}

export async function isRateLimited(env: Env, bucket: string, limit: number, windowSeconds: number) {
  const cutoff = Math.floor(Date.now() / 1000) - windowSeconds;
  await env.DB.prepare("DELETE FROM rate_limit_events WHERE created_at < ?").bind(cutoff).run();
  const row = await first<{ count: number }>(env.DB.prepare("SELECT COUNT(*) as count FROM rate_limit_events WHERE bucket = ? AND created_at >= ?").bind(bucket, cutoff));
  if (Number(row?.count ?? 0) >= limit) return true;
  await env.DB.prepare("INSERT INTO rate_limit_events (id, bucket, created_at) VALUES (?, ?, ?)").bind(makeOpaqueId(), bucket, Math.floor(Date.now() / 1000)).run();
  return false;
}

export async function writeAudit(env: Env, actorProfileId: string | null, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown> = {}) {
  await env.DB.prepare("INSERT INTO audit_log (id, actor_profile_id, action, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?)").bind(makeOpaqueId(), actorProfileId, action, entityType, entityId, JSON.stringify(metadata)).run();
}
