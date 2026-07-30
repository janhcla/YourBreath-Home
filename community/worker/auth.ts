import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from "jose";
import { cookieHeader, hashToken, makeOpaqueId, parseCookies, jsonResponse } from "./domain.mjs";
import { getCookieNames, sessionCookieMaxAge } from "./repository";
import type { Env } from "./types";

const APPLE_AUTHORIZE_URL = "https://appleid.apple.com/auth/authorize";
const APPLE_TOKEN_URL = "https://appleid.apple.com/auth/token";
const APPLE_ISSUER = "https://appleid.apple.com";
const APPLE_JWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

function requireAppleConfig(env: Env) {
  const values = [env.APPLE_TEAM_ID, env.APPLE_KEY_ID, env.APPLE_CLIENT_ID, env.APPLE_PRIVATE_KEY];
  if (values.some((value) => !value)) throw new Error("Apple authentication is not configured");
  return {
    teamId: env.APPLE_TEAM_ID!,
    keyId: env.APPLE_KEY_ID!,
    clientId: env.APPLE_CLIENT_ID!,
    privateKey: env.APPLE_PRIVATE_KEY!,
  };
}

export function safeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value.slice(0, 200);
}

export function appleRedirectUri(request: Request) {
  return new URL("/api/auth/apple/callback", request.url).toString();
}

export function buildAppleAuthorizeUrl(request: Request, clientId: string, state: string, nonce: string) {
  const url = new URL(APPLE_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  // Apple requires form_post whenever name or email scopes are requested.
  url.searchParams.set("response_mode", "form_post");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", appleRedirectUri(request));
  url.searchParams.set("scope", "name email");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  return url.toString();
}

async function appleClientSecret(env: Env) {
  const config = requireAppleConfig(env);
  const key = await importPKCS8(config.privateKey.replace(/\\n/g, "\n"), "RS256");
  return new SignJWT({}).setProtectedHeader({ alg: "RS256", kid: config.keyId, typ: "JWT" }).setIssuer(config.teamId).setSubject(config.clientId).setAudience(APPLE_ISSUER).setIssuedAt().setExpirationTime("5m").sign(key);
}

export async function startAppleSignIn(request: Request, env: Env) {
  const config = requireAppleConfig(env);
  const state = makeOpaqueId();
  const nonce = makeOpaqueId();
  const stateHash = await hashToken(state);
  const nonceHash = await hashToken(nonce);
  const returnPath = safeReturnPath(new URL(request.url).searchParams.get("return_to"));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await env.DB.prepare("INSERT INTO auth_nonces (state_hash, nonce_hash, return_path, expires_at) VALUES (?, ?, ?, ?)").bind(stateHash, nonceHash, returnPath, expiresAt).run();
  return Response.redirect(buildAppleAuthorizeUrl(request, config.clientId, state, nonce), 302);
}

async function exchangeCode(request: Request, env: Env, code: string) {
  const config = requireAppleConfig(env);
  const form = new URLSearchParams({ client_id: config.clientId, client_secret: await appleClientSecret(env), code, grant_type: "authorization_code", redirect_uri: appleRedirectUri(request) });
  const response = await fetch(APPLE_TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form });
  if (!response.ok) throw new Error("Apple authorization code exchange failed");
  const payload = await response.json() as { id_token?: string };
  if (!payload.id_token) throw new Error("Apple authorization response did not contain an identity token");
  return payload.id_token;
}

export async function completeAppleSignIn(request: Request, env: Env) {
  const params = request.method === "POST"
    ? await request.formData()
    : new URL(request.url).searchParams;
  const state = params.get("state");
  const code = params.get("code");
  if (!state || !code) throw new Error("Apple authorization response is incomplete");
  const nonce = await env.DB.prepare("SELECT state_hash, nonce_hash, return_path FROM auth_nonces WHERE state_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP").bind(await hashToken(state)).first<{ state_hash: string; nonce_hash: string; return_path: string }>();
  if (!nonce) throw new Error("Apple authorization state is invalid or expired");
  await env.DB.prepare("UPDATE auth_nonces SET used_at = CURRENT_TIMESTAMP WHERE state_hash = ? AND used_at IS NULL").bind(nonce.state_hash).run();
  const idToken = await exchangeCode(request, env, code);
  const verified = await jwtVerify(idToken, APPLE_JWKS, { issuer: APPLE_ISSUER, audience: requireAppleConfig(env).clientId });
  if (typeof verified.payload.nonce !== "string" || await hashToken(verified.payload.nonce) !== nonce.nonce_hash) throw new Error("Apple identity nonce did not match");
  const subject = String(verified.payload.sub ?? "");
  if (!subject) throw new Error("Apple identity token did not contain a subject");
  const email = typeof verified.payload.email === "string" ? verified.payload.email : null;
  const existing = await env.DB.prepare("SELECT id FROM profiles WHERE apple_subject = ?").bind(subject).first<{ id: string }>();
  const profileId = existing?.id ?? makeOpaqueId();
  const role = env.COMMUNITY_ADMIN_APPLE_SUBJECT && env.COMMUNITY_ADMIN_APPLE_SUBJECT === subject ? "admin" : "user";
  if (existing) await env.DB.prepare("UPDATE profiles SET email = COALESCE(?, email), role = ? WHERE id = ?").bind(email, role, profileId).run();
  else await env.DB.prepare("INSERT INTO profiles (id, display_name, email, apple_subject, role) VALUES (?, ?, ?, ?, ?)").bind(profileId, email?.split("@")[0] ?? "Apple member", email, subject, role).run();

  const cookies = parseCookies(request.headers.get("Cookie"));
  const anonymousCookie = cookies[getCookieNames().anonymous];
  const anonymousId = anonymousCookie ? await hashToken(anonymousCookie) : null;
  if (anonymousId) {
    const anonymousVotes = await env.DB.prepare("SELECT suggestion_id FROM votes WHERE anonymous_participant_id = ?").bind(anonymousId).all<{ suggestion_id: string }>();
    for (const vote of anonymousVotes.results) {
      await env.DB.prepare("INSERT OR IGNORE INTO votes (suggestion_id, user_id) VALUES (?, ?)").bind(vote.suggestion_id, profileId).run();
    }
    await env.DB.prepare("DELETE FROM votes WHERE anonymous_participant_id = ?").bind(anonymousId).run();
    await env.DB.prepare("UPDATE suggestions SET author_user_id = ?, anonymous_author_id = NULL WHERE anonymous_author_id = ?").bind(profileId, anonymousId).run();
  }

  const sessionToken = makeOpaqueId();
  const expiresAt = new Date(Date.now() + sessionCookieMaxAge() * 1000).toISOString();
  await env.DB.prepare("INSERT INTO sessions (id_hash, profile_id, anonymous_participant_id, expires_at) VALUES (?, ?, ?, ?)").bind(await hashToken(sessionToken), profileId, anonymousId, expiresAt).run();
  const headers = new Headers({ location: new URL(nonce.return_path, request.url).toString() });
  headers.append("Set-Cookie", cookieHeader(getCookieNames().session, sessionToken, { maxAge: sessionCookieMaxAge() }));
  return new Response(null, { status: 302, headers });
}

export async function logout(request: Request, env: Env) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const token = cookies[getCookieNames().session];
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE id_hash = ?").bind(await hashToken(token)).run();
  return new Response(null, { status: 204, headers: { "Set-Cookie": cookieHeader(getCookieNames().session, "", { deleteCookie: true }) } });
}

export function authConfigurationError() {
  return jsonResponse({ error: "Sign in is temporarily unavailable" }, 503);
}
