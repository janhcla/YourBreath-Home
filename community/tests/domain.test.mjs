import assert from "node:assert/strict";
import test from "node:test";

const domain = await import("../worker/domain.mjs").catch(() => null);

test("suggestion validation accepts bounded public input", () => {
  assert.ok(domain, "worker/domain.mjs must exist");
  const result = domain.validateSuggestionInput({
    title: "Save a calmer rhythm",
    description: "Keep a few personal rhythms ready for different days.",
    category: "Sessions & customisation",
  });
  assert.deepEqual(result, {
    ok: true,
    value: {
      title: "Save a calmer rhythm",
      description: "Keep a few personal rhythms ready for different days.",
      category: "Sessions & customisation",
    },
  });
});

test("suggestion validation rejects empty and oversized fields", () => {
  assert.ok(domain);
  assert.equal(domain.validateSuggestionInput({ title: "", description: "x", category: "Other" }).ok, false);
  assert.equal(domain.validateSuggestionInput({ title: "x".repeat(101), description: "x", category: "Other" }).ok, false);
  assert.equal(domain.validateSuggestionInput({ title: "x", description: "x".repeat(1001), category: "Other" }).ok, false);
  assert.equal(domain.validateSuggestionInput({ title: "x", description: "x", category: "Unknown" }).ok, false);
});

test("cookie helper emits secure session attributes", () => {
  assert.ok(domain);
  const header = domain.cookieHeader("yb_session", "opaque", { maxAge: 3600 });
  assert.match(header, /^yb_session=opaque;/);
  assert.match(header, /HttpOnly/);
  assert.match(header, /Secure/);
  assert.match(header, /SameSite=Lax/);
  assert.match(header, /Path=\//);
  assert.match(header, /Max-Age=3600/);
});

test("same-origin guard accepts the public site origin and rejects another origin", () => {
  assert.ok(domain);
  const accepted = new Request("https://feedback.yourbreath.app/api/votes/toggle", {
    headers: { origin: "https://feedback.yourbreath.app" },
  });
  const rejected = new Request("https://feedback.yourbreath.app/api/votes/toggle", {
    headers: { origin: "https://evil.example" },
  });
  assert.equal(domain.isSameOrigin(accepted), true);
  assert.equal(domain.isSameOrigin(rejected), false);
});

test("hashToken is deterministic and opaque", async () => {
  assert.ok(domain);
  const first = await domain.hashToken("test-token");
  assert.equal(first, await domain.hashToken("test-token"));
  assert.notEqual(first, "test-token");
  assert.match(first, /^[a-f0-9]{64}$/);
});

