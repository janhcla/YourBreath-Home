import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const auth = await readFile(new URL("../worker/auth.ts", import.meta.url), "utf8");
const api = await readFile(new URL("../worker/api.ts", import.meta.url), "utf8");
const admin = await readFile(new URL("../worker/admin.ts", import.meta.url), "utf8");

test("Apple flow stores hashed state and verifies the provider identity", () => {
  assert.match(auth, /hashToken\(state\)/);
  assert.match(auth, /used_at IS NULL/);
  assert.match(auth, /jwtVerify/);
  assert.match(auth, /nonce_hash/);
  assert.match(auth, /Set-Cookie/);
});

test("admin API is server-role guarded and audited", () => {
  assert.match(api, /identity\.profile\.role !== "admin"/);
  assert.match(api, /\/api\/admin\/overview/);
  assert.match(admin, /audit_log/);
  assert.match(admin, /suggestion_status_history/);
  assert.match(admin, /notifications/);
});

