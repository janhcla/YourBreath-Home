import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const api = await readFile(new URL("../app/community-api.ts", import.meta.url), "utf8");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("Community frontend uses the Worker API instead of browser-local state", () => {
  assert.doesNotMatch(page, /localStorage/);
  assert.match(api, /\/api\/suggestions/);
  assert.match(api, /\/api\/votes\/toggle/);
  assert.match(api, /\/api\/auth\/apple\/start/);
});

test("Community frontend keeps the under-construction notice visible", () => {
  assert.match(layout, /Under construction/);
});
