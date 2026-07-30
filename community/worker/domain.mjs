export const COMMUNITY_ORIGIN = "https://feedback.yourbreath.app";

export const CATEGORIES = [
  "Breathing techniques",
  "Sessions & customisation",
  "Apple Watch",
  "Live biofeedback",
  "Progress & insights",
  "Programs",
  "Reminders & habits",
  "Widgets & complications",
  "Accessibility",
  "Premium",
  "Other",
];

export const STATUSES = ["New", "Under review", "Planned", "In progress", "Shipped", "Not planned"];

const encoder = new TextEncoder();

function boundedString(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

export function validateSuggestionInput(input) {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid request body" };
  const { title, description, category } = input;
  if (!boundedString(title, 100)) return { ok: false, error: "Title must be between 1 and 100 characters" };
  if (!boundedString(description, 1000)) return { ok: false, error: "Description must be between 1 and 1000 characters" };
  if (!CATEGORIES.includes(category)) return { ok: false, error: "Choose a valid category" };
  return { ok: true, value: { title: title.trim(), description: description.trim(), category } };
}

export function validateCommentInput(input) {
  if (!input || typeof input !== "object" || !boundedString(input.body, 2000)) {
    return { ok: false, error: "Comment must be between 1 and 2000 characters" };
  }
  return { ok: true, value: { body: input.body.trim() } };
}

export function validateReportInput(input) {
  const validReasons = ["spam", "abuse", "personal information", "medical information", "other"];
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid request body" };
  if (!validReasons.includes(input.reason)) return { ok: false, error: "Choose a valid report reason" };
  if (input.details !== undefined && (typeof input.details !== "string" || input.details.trim().length > 500)) {
    return { ok: false, error: "Report details must be 500 characters or fewer" };
  }
  return { ok: true, value: { reason: input.reason, details: input.details?.trim() ?? "" } };
}

export function validateStatus(value) {
  return STATUSES.includes(value);
}

export function makeOpaqueId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  globalThis.crypto?.getRandomValues?.(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashToken(value) {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function parseCookies(header) {
  return Object.fromEntries((header ?? "").split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return index === -1 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}

export function cookieHeader(name, value, { maxAge, expires, deleteCookie = false } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "HttpOnly", "Secure", "SameSite=Lax"];
  if (deleteCookie) parts.push("Max-Age=0");
  else if (maxAge !== undefined) parts.push(`Max-Age=${Math.floor(maxAge)}`);
  if (expires) parts.push(`Expires=${new Date(expires).toUTCString()}`);
  return parts.join(";");
}

export function isSameOrigin(request) {
  const origin = request.headers.get("Origin") || request.headers.get("Referer");
  if (!origin) return request.method === "GET" || request.method === "HEAD";
  try {
    return new URL(origin).origin === new URL(request.url).origin && new URL(request.url).origin === COMMUNITY_ORIGIN;
  } catch {
    return false;
  }
}

export function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

