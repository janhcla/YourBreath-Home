# YourBreath Community Production Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the browser-local Community prototype with a public Cloudflare Worker + D1 feedback service and link it from the live `yourbreath.app` marketing site.

**Architecture:** Keep the existing Vinext Worker for HTML and add a focused `/api` dispatcher with D1 repositories and server-side cookie sessions. Keep the current Community visual language, replacing localStorage mutations with API calls and guarded admin/auth flows. Deploy the Worker and marketing Pages project independently, then verify both live domains.

**Tech Stack:** Cloudflare Workers, D1, Drizzle schema, Vinext/React 19, TypeScript, Node `node:test`, Vite, Cloudflare Pages.

## Global Constraints

- D1 is the canonical Community data store; browser localStorage is not used for votes, follows, submissions, comments, activity, or auth.
- No database credentials, Apple private keys, Cloudflare tokens, or service-role capability may enter client bundles, repository files, logs, or reports.
- Anonymous browsing/voting/suggesting/reporting remains available; follows, comments, cross-device activity, notifications, and admin actions require server authentication.
- Only `feedback.yourbreath.app` Community code and the explicit marketing CTA may change; the existing YourBreath app and unrelated Cloudflare configuration remain untouched.
- Every new behavior gets a failing test before implementation and the smallest passing implementation afterward.

---

### Task 1: Establish testable domain contracts

**Files:**
- Create: `community/worker/types.ts`
- Create: `community/worker/validation.ts`
- Create: `community/worker/security.ts`
- Test: `community/tests/domain.test.mjs`

**Interfaces:**
- `validateSuggestionInput(value: unknown): { ok: true; value: ... } | { ok: false; error: string }`
- `validateCommentInput(value: unknown): { ok: true; value: ... } | { ok: false; error: string }`
- `validateReportInput(value: unknown): { ok: true; value: ... } | { ok: false; error: string }`
- `makeOpaqueId(): string`
- `hashToken(value: string): Promise<string>`
- `cookieHeader(name: string, value: string, options: CookieOptions): string`
- `isSameOrigin(request: Request): boolean`

- [ ] **Step 1: Write failing validation and cookie tests** covering max lengths, allowed categories/statuses, empty input, stable SHA-256 output, secure cookie attributes, and cross-origin write rejection.
- [ ] **Step 2: Run `node --test tests/domain.test.mjs`** and confirm the new module imports/functions fail because the modules do not yet exist.
- [ ] **Step 3: Implement the pure validators and security helpers** with no D1 dependency and with generic error messages.
- [ ] **Step 4: Run the targeted test again** and confirm all cases pass.
- [ ] **Step 5: Commit** with `git add community/worker community/tests/domain.test.mjs && git commit -m "Add Community domain and security contracts"`.

### Task 2: Add the production D1 migration and schema

**Files:**
- Create: `community/drizzle/0002_production_backend.sql`
- Modify: `community/drizzle/meta/_journal.json`
- Modify: `community/db/schema.ts`
- Create: `community/tests/migration-contract.test.mjs`

**Interfaces:**
- D1 tables: `sessions`, `auth_nonces`, `audit_log`, `notifications`, `notification_preferences`.
- `profiles.apple_subject` is unique and nullable; existing user-facing tables remain compatible.

- [ ] **Step 1: Write a migration contract test** asserting the migration contains the session hash primary key, nonce expiry/used fields, audit records, notification preference primary key, Apple subject uniqueness, and the partial vote indexes/identity trigger.
- [ ] **Step 2: Run the contract test** and confirm it fails because migration `0002` is absent.
- [ ] **Step 3: Implement the idempotent SQL migration and matching Drizzle declarations**; use stable indexes and `INSERT OR IGNORE` for existing categories and roadmap seeds.
- [ ] **Step 4: Run the migration contract test plus `npm run db:generate`** and confirm the schema compiles without changing unrelated tables.
- [ ] **Step 5: Apply the migration to the existing D1 database only after local verification** with `npm run db:migrate`, then query table names/counts read-only.
- [ ] **Step 6: Commit** with `git add community/drizzle community/db/schema.ts community/tests/migration-contract.test.mjs && git commit -m "Add production Community D1 schema"`.

### Task 3: Implement repository-backed public API

**Files:**
- Create: `community/worker/repository.ts`
- Create: `community/worker/api.ts`
- Modify: `community/worker/index.ts`
- Test: `community/tests/api-contract.test.mjs`

**Interfaces:**
- `handleApi(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>`
- `GET /api/session`, `/api/suggestions`, `/api/activity`
- `POST /api/suggestions`, `/api/votes/toggle`, `/api/reports`
- anonymous cookie name `yb_anon`, session cookie name `yb_session`.

- [ ] **Step 1: Write failing request/response tests** for public listing, anonymous cookie issuance, invalid suggestion rejection, vote idempotency, and report validation using an in-memory repository seam.
- [ ] **Step 2: Run the targeted API tests** and confirm the dispatcher/endpoints are absent.
- [ ] **Step 3: Implement D1 repository queries and the API dispatcher** with bounded JSON parsing, same-origin checks, anonymous participant upsert, aggregation counts, and duplicate-safe vote toggles.
- [ ] **Step 4: Run targeted tests and TypeScript lint** until all public contracts pass.
- [ ] **Step 5: Verify the Worker still serves HTML and image optimization** for non-API requests.
- [ ] **Step 6: Commit** with `git add community/worker community/tests/api-contract.test.mjs && git commit -m "Add Community public D1 API"`.

### Task 4: Implement authentication, notifications, and admin API

**Files:**
- Create: `community/worker/auth.ts`
- Create: `community/worker/admin.ts`
- Modify: `community/worker/api.ts`
- Modify: `community/wrangler.jsonc`
- Test: `community/tests/auth-admin.test.mjs`
- Modify: `community/docs/deployment.md`

**Interfaces:**
- `GET /api/auth/apple/start`, `/api/auth/apple/callback`
- `POST /api/auth/logout`
- `POST /api/follows/toggle`, `/api/comments`
- `GET/POST /api/notifications`, `/api/notification-preferences`
- `GET /api/admin/overview`, `PATCH /api/admin/suggestions/:id`, `POST /api/admin/suggestions/:id/merge`, `PATCH /api/admin/reports/:id`.

- [ ] **Step 1: Write failing tests** for unauthenticated follow/comment/admin rejection, session cookie creation, state/nonce one-time use, admin-only status mutation, transactional audit/notification intent, and locked comments.
- [ ] **Step 2: Run targeted tests** and confirm the auth/admin endpoints fail.
- [ ] **Step 3: Implement opaque sessions and Apple OAuth state/callback exchange**; verify the Apple identity token using `jose`/WebCrypto, map `sub` to a profile, claim anonymous activity, and assign admin only from the server secret.
- [ ] **Step 4: Implement authenticated writes, notification creation, report review, status history, merge behavior, and audit logging** behind a single server-side role check.
- [ ] **Step 5: Run targeted tests, lint, and a local Worker build**; document the exact required secrets without values.
- [ ] **Step 6: Commit** with `git add community/worker community/wrangler.jsonc community/docs/deployment.md community/tests/auth-admin.test.mjs && git commit -m "Add Community auth moderation and admin API"`.

### Task 5: Migrate the Community UI to server data

**Files:**
- Create: `community/app/community-api.ts`
- Modify: `community/app/page.tsx`
- Modify: `community/app/admin/page.tsx`
- Modify: `community/app/globals.css`
- Test: `community/tests/frontend-contract.test.mjs`

**Interfaces:**
- `fetchSession(): Promise<SessionState>`
- `fetchSuggestions(filters): Promise<Suggestion[]>`
- `toggleVote(id)`, `toggleFollow(id)`, `createSuggestion(input)`, `createComment(input)`, `createReport(input)`.

- [ ] **Step 1: Write failing static/DOM contract tests** asserting no Community localStorage access, API URLs are used for writes, and the “Under construction” banner remains visible.
- [ ] **Step 2: Run the targeted frontend contract test** and confirm the current localStorage/fake-auth implementation fails it.
- [ ] **Step 3: Add typed API helpers and replace hydration/persistence with session and suggestion fetches** while preserving existing card/modal/filter layouts.
- [ ] **Step 4: Replace vote/follow/suggest/comment/sign-in actions with API calls** including loading, error, retry, optimistic rollback, and sign-in redirect states.
- [ ] **Step 5: Replace the admin preview with server-gated overview/edit/report controls** and accessible unauthorized/error states.
- [ ] **Step 6: Run frontend tests, lint, and build; commit** with `git add community/app community/tests/frontend-contract.test.mjs && git commit -m "Connect Community UI to production API"`.

### Task 6: Repair tests, harden headers, and run release checks

**Files:**
- Modify: `community/tests/rendered-html.test.mjs`
- Modify: `community/worker/index.ts`
- Modify: `community/docs/security-review.md`
- Create: `community/tests/security-headers.test.mjs`

- [ ] **Step 1: Replace the obsolete `codex-preview` assertion** with assertions for the current Community title, “Under construction” notice, and HTML content type.
- [ ] **Step 2: Write failing security-header tests** for API/HTML responses.
- [ ] **Step 3: Add baseline headers without breaking Vinext assets** and ensure API errors are JSON.
- [ ] **Step 4: Run `npm test`, `npm run lint`, `npm run build`, `npm run validate:artifact`, and the targeted Node tests**; repair all regressions rather than suppressing them.
- [ ] **Step 5: Commit** with `git add community/tests community/worker/index.ts community/docs/security-review.md && git commit -m "Harden and verify Community release checks"`.

### Task 7: Add and deploy the marketing CTA

**Files:**
- Modify: `App.tsx`
- Create: `tests/marketing-community-link.test.mjs`
- Modify: `README.md` only if deployment evidence needs a current link.

- [ ] **Step 1: Write a failing static test** for the exact public URL and accessible description.
- [ ] **Step 2: Add a compact Community CTA in the existing marketing layout**: “Help shape YourBreath” with copy explaining suggestions, votes, and roadmap, linking to `https://feedback.yourbreath.app`.
- [ ] **Step 3: Run the static test and `npm run build`**.
- [ ] **Step 4: Deploy the root Pages project with `npm run deploy`** and verify the CTA in the live HTML/browser.
- [ ] **Step 5: Commit** with `git add App.tsx tests/marketing-community-link.test.mjs && git commit -m "Link marketing site to YourBreath Community"`.

### Task 8: Deploy and verify the complete public workflow

**Files:**
- Modify: `community/docs/qa-report.md`
- Modify: `community/docs/deployment.md`

- [ ] **Step 1: Run the final local gates** and record exact pass/fail results.
- [ ] **Step 2: Apply any verified D1 migration and deploy the Worker** using the existing Cloudflare secret mechanism; do not change DNS or unrelated zone settings.
- [ ] **Step 3: Check live DNS/HTTPS and API contracts** with `curl` for `/`, `/roadmap`, `/shipped`, `/privacy`, `/terms`, `/api/session`, and `/api/suggestions`.
- [ ] **Step 4: Use the in-app browser on `feedback.yourbreath.app`** to verify visible branding, banner, filters, modal, anonymous vote/suggestion path, and that no temporary `jhbc.chatgpt.site` redirect occurs.
- [ ] **Step 5: Verify `https://yourbreath.app` still returns the marketing site and visibly contains the Community link.**
- [ ] **Step 6: Record any remaining external Apple-secret configuration gate explicitly; do not claim Sign in with Apple is live until callback configuration is verified.**
- [ ] **Step 7: Commit QA/deployment evidence and report the final public URL.**

