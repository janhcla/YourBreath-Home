# YourBreath Community Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a polished, mobile-first YourBreath Community surface that demonstrates frictionless participation and preserves a clear production path for persistence, auth and moderation.

**Architecture:** A Vinext app with a shared public shell, client-side Community state for the current Sites runtime, dedicated privacy/terms/admin routes, and documented D1/Supabase contracts. The local state adapter uses an opaque browser identifier and is replaceable by server operations without changing components.

**Tech Stack:** Vinext/React 19, TypeScript, Tailwind CSS 4, Drizzle schema notes, Sites lifecycle, semantic HTML and localStorage for the current unbound runtime.

## Global Constraints

- Participation must not require authentication.
- Anonymous votes are described as Votes, never verified unique people.
- YourBreath app data and Community data remain separate privacy domains.
- No third-party analytics, fingerprinting, health profiling or Premium vote weighting.
- Target mobile widths: 390px, 768px and 1440px; target WCAG 2.2 AA.
- Statuses are New, Under review, Planned, In progress, Shipped and Not planned.
- Community sign-in is optional and must not be called creating a YourBreath account.

### Task 1: Design and shell

**Files:** `app/page.tsx`, `app/globals.css`, `app/layout.tsx`

- [ ] Replace starter content with the public Community shell and reusable local state model.
- [ ] Add responsive navigation, compact intro, filters, status treatments and suggestion rows.
- [ ] Add accessible focus, reduced-motion and keyboard behavior.
- [ ] Add browser-local voting and submission state labelled as device-local.
- [ ] Run the production build and rendered HTML test.

### Task 2: Public workflow states

**Files:** `app/page.tsx`, `app/admin/page.tsx`

- [ ] Add Roadmap, Shipped, My Activity, detail view, suggestion modal, follow prompt and sign-in explanation.
- [ ] Add admin operations view with status movement, developer response, pin/hide controls and duplicate candidates.
- [ ] Keep admin authorization boundary explicit in the UI and architecture notes.
- [ ] Verify search, filters, voting, submission, follow and status transitions with rendered tests.

### Task 3: Policy and operational documentation

**Files:** `app/privacy/page.tsx`, `app/terms/page.tsx`, `docs/architecture.md`, `docs/admin-guide.md`, `db/schema.ts`, `drizzle/0001_community.sql`

- [ ] Publish Community-specific privacy notice and terms.
- [ ] Document the production data model, anonymous identity, claim-later flow, RLS/auth, anti-abuse and merge transaction.
- [ ] Add a D1-compatible schema migration as a persistence contract, without pretending it is live while the binding is absent.
- [ ] Write the admin guide and deployment/custom-domain steps.

### Task 4: QA and publishing

**Files:** `tests/rendered-html.test.mjs`, `docs/qa-report.md`

- [ ] Run lint, build, artifact validation and rendered tests.
- [ ] Start agent preview and test the target flow at desktop and mobile sizes.
- [ ] Capture the final implementation screenshot, inspect it, and record a five-point fidelity ledger.
- [ ] Commit the verified source, checkpoint it and deploy the saved version.
