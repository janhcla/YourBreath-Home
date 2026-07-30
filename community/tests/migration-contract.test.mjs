import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(new URL("../drizzle/0002_production_backend.sql", import.meta.url), "utf8").catch(() => "");

test("production migration defines server-side identity and audit tables", () => {
  assert.ok(migration, "0002 migration must exist");
  for (const table of ["sessions", "auth_nonces", "audit_log", "notifications", "notification_preferences", "rate_limit_events"]) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, "i"));
  }
  assert.match(migration, /sessions[\s\S]*id_hash[\s\S]*expires_at/i);
  assert.match(migration, /auth_nonces[\s\S]*used_at/i);
  assert.match(migration, /profiles_apple_subject_unique/i);
  assert.match(migration, /votes_authenticated_unique/i);
  assert.match(migration, /votes_exactly_one_identity/i);
});

test("production migration seeds stable roadmap data without fake comments", () => {
  assert.match(migration, /INSERT OR IGNORE INTO suggestions/i);
  assert.match(migration, /saved-rhythms/);
  assert.match(migration, /shipped-watch/);
  assert.doesNotMatch(migration, /INSERT INTO comments/i);
});

