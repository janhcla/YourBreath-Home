import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../App.tsx", import.meta.url), "utf8");

test("marketing site links to the public YourBreath Community", () => {
  assert.match(app, /https:\/\/feedback\.yourbreath\.app/);
  assert.match(app, /Suggest features, vote on ideas and follow the public roadmap/);
  assert.match(app, /your breathing sessions and HealthKit data stay out of it/);
});

