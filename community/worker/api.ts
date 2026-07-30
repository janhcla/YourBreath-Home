import {
  cookieHeader,
  isSameOrigin,
  jsonResponse,
  validateCommentInput,
  validateReportInput,
  validateSuggestionInput,
} from "./domain.mjs";
import {
  createComment,
  createReport,
  createSuggestion,
  getActivity,
  getCookieNames,
  getSuggestion,
  isRateLimited,
  listSuggestions,
  loadIdentity,
  toggleFollow,
  toggleVote,
} from "./repository";
import { adminOverview, mergeSuggestion, updateReport, updateSuggestion } from "./admin";
import { completeAppleSignIn, logout, startAppleSignIn } from "./auth";
import { getPreferences, listNotifications, markNotificationsRead, updatePreferences } from "./notifications";
import type { Env, ExecutionContext, Identity } from "./types";

const MAX_BODY_BYTES = 64 * 1024;

async function readJson(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return { ok: false as const, error: "Request body is too large" };
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return { ok: false as const, error: "Request body is too large" };
  try {
    return { ok: true as const, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false as const, error: "Invalid JSON body" };
  }
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

function withAnonymousCookie(response: Response, identity: Identity) {
  if (!identity.setAnonymousCookie) return response;
  const headers = new Headers(response.headers);
  const cookie = getCookieNames().anonymous;
  const raw = identity.anonymousCookieValue ?? "";
  headers.append("Set-Cookie", cookieHeader(cookie, raw, { maxAge: 60 * 60 * 24 * 365 }));
  return new Response(response.body, { status: response.status, headers });
}

async function requireIdentity(env: Env, request: Request) {
  return loadIdentity(env, request);
}

function identityBucket(identity: Identity, endpoint: string) {
  return `${endpoint}:${identity.profile?.id ?? identity.anonymousId ?? "unknown"}`;
}

export async function handleApi(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  void ctx;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (!path.startsWith("/api")) return errorResponse("Not found", 404);
  const write = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { allow: "GET, POST, PUT, PATCH, OPTIONS" } });
  if (write && !isSameOrigin(request)) return errorResponse("Cross-origin request rejected", 403);

  try {
    if (request.method === "GET" && path === "/api/auth/apple/start") return await startAppleSignIn(request, env);
    if (request.method === "GET" && path === "/api/auth/apple/callback") return await completeAppleSignIn(request, env);
    if (request.method === "POST" && path === "/api/auth/logout") return await logout(request, env);

    const identity = await requireIdentity(env, request);

    if (request.method === "GET" && path === "/api/session") {
      const response = jsonResponse({
        authenticated: Boolean(identity.profile),
        anonymous: Boolean(identity.anonymousId),
        user: identity.profile ? { id: identity.profile.id, displayName: identity.profile.displayName, role: identity.profile.role } : null,
      });
      return withAnonymousCookie(response, identity);
    }

    if (request.method === "GET" && path === "/api/suggestions") {
      const suggestions = await listSuggestions(env, identity, {
        query: url.searchParams.get("q") ?? "",
        category: url.searchParams.get("category") ?? "",
        status: url.searchParams.get("status") ?? "",
        sort: url.searchParams.get("sort") ?? "Top",
      });
      return withAnonymousCookie(jsonResponse({ suggestions }), identity);
    }

    const detailMatch = path.match(/^\/api\/suggestions\/([^/]+)$/);
    if (request.method === "GET" && detailMatch) {
      const suggestion = await getSuggestion(env, identity, decodeURIComponent(detailMatch[1]));
      return withAnonymousCookie(suggestion ? jsonResponse({ suggestion }) : errorResponse("Idea not found", 404), identity);
    }

    if (request.method === "GET" && path === "/api/activity") {
      return withAnonymousCookie(jsonResponse({ activity: await getActivity(env, identity) }), identity);
    }

    if (request.method === "GET" && path === "/api/notifications") {
      if (!identity.profile) return errorResponse("Sign in to view notifications", 401);
      return jsonResponse({ notifications: await listNotifications(env, identity.profile.id) });
    }

    if (request.method === "POST" && path === "/api/notifications/read") {
      if (!identity.profile) return errorResponse("Sign in to update notifications", 401);
      const body = await readJson(request);
      if (!body.ok) return errorResponse(body.error, 400);
      const id = body.value && typeof body.value === "object" && typeof body.value.id === "string" ? body.value.id : undefined;
      await markNotificationsRead(env, identity.profile.id, id);
      return jsonResponse({ ok: true });
    }

    if (request.method === "GET" && path === "/api/notification-preferences") {
      if (!identity.profile) return errorResponse("Sign in to view notification preferences", 401);
      return jsonResponse({ preferences: await getPreferences(env, identity.profile.id) });
    }

    if (request.method === "PUT" && path === "/api/notification-preferences") {
      if (!identity.profile) return errorResponse("Sign in to update notification preferences", 401);
      const body = await readJson(request);
      if (!body.ok || !body.value || typeof body.value !== "object") return errorResponse("Preferences are required", 422);
      const value = body.value as Record<string, unknown>;
      if (typeof value.statusUpdates !== "boolean" || typeof value.commentReplies !== "boolean") return errorResponse("Preferences are invalid", 422);
      return jsonResponse({ preferences: await updatePreferences(env, identity.profile.id, { statusUpdates: value.statusUpdates, commentReplies: value.commentReplies }) });
    }

    const adminSuggestionMatch = path.match(/^\/api\/admin\/suggestions\/([^/]+)$/);
    const adminMergeMatch = path.match(/^\/api\/admin\/suggestions\/([^/]+)\/merge$/);
    const adminReportMatch = path.match(/^\/api\/admin\/reports\/([^/]+)$/);
    if (path === "/api/admin/overview" || adminSuggestionMatch || adminMergeMatch || adminReportMatch || path.includes("/api/admin/")) {
      if (!identity.profile || identity.profile.role !== "admin") return errorResponse("Admin access required", 403);
      if (request.method === "GET" && path === "/api/admin/overview") return jsonResponse(await adminOverview(env));
      if (request.method === "PATCH" && adminSuggestionMatch) {
        const body = await readJson(request);
        if (!body.ok || !body.value || typeof body.value !== "object") return errorResponse("Admin update is required", 422);
        const result = await updateSuggestion(env, identity.profile.id, decodeURIComponent(adminSuggestionMatch[1]), body.value as Record<string, unknown>);
        return result.ok ? jsonResponse(result) : errorResponse(result.error, 422);
      }
      if (request.method === "POST" && adminMergeMatch) {
        const body = await readJson(request);
        if (!body.ok || !body.value || typeof body.value !== "object" || typeof body.value.canonicalId !== "string") return errorResponse("Canonical idea id is required", 422);
        const result = await mergeSuggestion(env, identity.profile.id, decodeURIComponent(adminMergeMatch[1]), body.value.canonicalId);
        return result.ok ? jsonResponse(result) : errorResponse(result.error, 422);
      }
      if (request.method === "PATCH" && adminReportMatch) {
        const body = await readJson(request);
        if (!body.ok || !body.value || typeof body.value !== "object") return errorResponse("Report update is required", 422);
        const value = body.value as Record<string, unknown>;
        const result = await updateReport(env, identity.profile.id, decodeURIComponent(adminReportMatch[1]), String(value.status ?? "reviewed"), Boolean(value.hideTarget));
        return result.ok ? jsonResponse(result) : errorResponse(result.error, 422);
      }
      return errorResponse("Not found", 404);
    }

    if (request.method === "POST" && path === "/api/suggestions") {
      if (await isRateLimited(env, identityBucket(identity, "suggestion"), 5, 60 * 60)) return errorResponse("Please wait before submitting another idea", 429);
      const body = await readJson(request);
      if (!body.ok) return errorResponse(body.error, 400);
      const input = validateSuggestionInput(body.value);
      if (!input.ok) return errorResponse(input.error, 422);
      const id = await createSuggestion(env, identity, input.value);
      return withAnonymousCookie(jsonResponse({ id }, 201), identity);
    }

    if (request.method === "POST" && path === "/api/votes/toggle") {
      if (await isRateLimited(env, identityBucket(identity, "vote"), 120, 60 * 60)) return errorResponse("Please wait before voting again", 429);
      const body = await readJson(request);
      if (!body.ok || !body.value || typeof body.value !== "object" || typeof body.value.id !== "string") return errorResponse("Idea id is required", 422);
      const result = await toggleVote(env, identity, body.value.id);
      return withAnonymousCookie(jsonResponse(result), identity);
    }

    if (request.method === "POST" && path === "/api/follows/toggle") {
      if (!identity.profile) return errorResponse("Sign in to follow ideas", 401);
      const body = await readJson(request);
      if (!body.ok || !body.value || typeof body.value !== "object" || typeof body.value.id !== "string") return errorResponse("Idea id is required", 422);
      return jsonResponse(await toggleFollow(env, identity.profile.id, body.value.id));
    }

    if (request.method === "POST" && path === "/api/comments") {
      if (!identity.profile) return errorResponse("Sign in to comment", 401);
      if (await isRateLimited(env, identityBucket(identity, "comment"), 20, 60 * 60)) return errorResponse("Please wait before adding another comment", 429);
      const body = await readJson(request);
      if (!body.ok || !body.value || typeof body.value !== "object" || typeof body.value.suggestionId !== "string") return errorResponse("Suggestion id is required", 422);
      const input = validateCommentInput(body.value);
      if (!input.ok) return errorResponse(input.error, 422);
      const result = await createComment(env, identity.profile.id, body.value.suggestionId, input.value.body);
      return result.ok ? jsonResponse({ id: result.id }, 201) : errorResponse(result.error, 409);
    }

    if (request.method === "POST" && path === "/api/reports") {
      if (await isRateLimited(env, identityBucket(identity, "report"), 10, 60 * 60)) return errorResponse("Please wait before sending another report", 429);
      const body = await readJson(request);
      if (!body.ok) return errorResponse(body.error, 400);
      const input = validateReportInput(body.value);
      if (!input.ok) return errorResponse(input.error, 422);
      const value = body.value as Record<string, unknown>;
      if (typeof value.suggestionId !== "string" && typeof value.commentId !== "string") return errorResponse("A suggestion or comment is required", 422);
      const id = await createReport(env, identity, { suggestionId: typeof value.suggestionId === "string" ? value.suggestionId : undefined, commentId: typeof value.commentId === "string" ? value.commentId : undefined, ...input.value });
      return withAnonymousCookie(jsonResponse({ id }, 201), identity);
    }

    return errorResponse("Not found", 404);
  } catch (error) {
    console.error("Community API error", error instanceof Error ? error.message : "unknown");
    return errorResponse("The Community service is temporarily unavailable", 503);
  }
}
