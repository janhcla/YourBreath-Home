# YourBreath Community Production Backend Design

**Date:** 2026-07-30  
**Status:** Approved for implementation

## Goal

Turn `feedback.yourbreath.app` from a browser-local feedback prototype into a public, server-backed Community while preserving the existing visual design and leaving the main YourBreath application and its deployment unchanged.

## Architecture

The existing Cloudflare Worker remains the single public entry point. It intercepts `/api/*` requests and serves the existing Vinext pages for all other paths. Cloudflare D1 is the canonical store for suggestions, votes, follows, comments, moderation, sessions, notifications, and audit records. The browser receives only public JSON and opaque HttpOnly session/anonymous cookies; no database credentials or service-role capability is exposed.

Anonymous participation uses a random first-party cookie whose hash is stored in D1. Authenticated participation uses an opaque, short-lived server session cookie. Sign in with Apple is implemented as a server-side OAuth flow with state/nonce records and secrets stored only as Cloudflare Worker secrets. The admin role is assigned and checked server-side from the verified Apple subject configured as a secret.

## Product behavior

- Browsing, searching, voting, suggesting, and reporting work without an account.
- Following ideas, commenting, cross-device activity, notifications, and admin actions require a verified Community session.
- All writes validate body size, origin, allowed values, and length before database work; output is rendered as text rather than HTML.
- Vote and follow toggles are idempotent and protected by database uniqueness constraints.
- Status changes, merges, hides, locks, and report decisions are transactional and audited.
- The current “Under construction” notice remains visible until the production deployment and live verification gates pass.
- The Community remains explicitly separate from YourBreath breathing sessions, HealthKit, and app data.

## API boundaries

Public endpoints:

- `GET /api/session`
- `GET /api/suggestions`
- `GET /api/activity`
- `POST /api/suggestions`
- `POST /api/votes/toggle`
- `POST /api/reports`

Authenticated endpoints:

- `POST /api/follows/toggle`
- `POST /api/comments`
- `GET /api/notifications`
- `POST /api/notifications/read`
- `GET /api/notification-preferences`
- `PUT /api/notification-preferences`
- `POST /api/auth/logout`

Authentication endpoints:

- `GET /api/auth/apple/start`
- `GET /api/auth/apple/callback`

Admin endpoints require the server-side `admin` role:

- `GET /api/admin/overview`
- `PATCH /api/admin/suggestions/:id`
- `POST /api/admin/suggestions/:id/merge`
- `PATCH /api/admin/reports/:id`

## Data model

The existing tables remain the public domain model. Migration `0002_production_backend.sql` adds hashed sessions, one-time Apple auth state, notification preferences and notifications, audit events, and the Apple subject index. The migration also adds the partial vote uniqueness indexes and identity trigger that are required because SQLite treats `NULL` values as distinct in a composite unique index.

Seed data is inserted with stable IDs and `INSERT OR IGNORE`; it represents product/roadmap entries rather than fabricated user comments. Re-running a deployment migration must not duplicate categories or suggestions.

## Security and failure handling

- Cookies are `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, and bounded by an explicit expiry.
- State-changing requests accept only same-origin `Origin`/`Referer` values and reject oversized or malformed JSON.
- Anonymous identifiers are random and opaque; IP metadata is transient abuse-control input only, never the voting identity.
- Admin endpoints return a generic `403` and never reveal role-selection details.
- Missing Apple secrets produce an explicit configuration error without exposing secret names or values to the browser.
- API errors use stable JSON `{ error: string }` responses and do not echo submitted secrets or sensitive headers.
- The Worker adds baseline security headers without changing DNS, SSL/TLS mode, Workers routes, or unrelated records.

## Testing and release gates

Pure validation, cookie, identity, and authorization helpers are covered by Node tests before implementation. API route tests use a small in-memory repository/DB seam so write behavior can be tested without polluting production D1. Build, lint, artifact validation, and rendered HTML tests run locally. After deployment, public API responses, all Community routes, HTTPS, no redirect to the temporary host, and the existing `yourbreath.app` site are checked. The marketing site receives one accessible Community CTA linking to `https://feedback.yourbreath.app` and is rebuilt/deployed separately.

