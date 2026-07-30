# YourBreath Community security review

## Scope

This review covers the D1-backed Worker implementation, browser client and
deployment configuration.

## Findings

### Closed — production persistence and authorization implementation

The Worker now owns public `/api` routes, D1 is canonical, anonymous ids are
opaque hashed cookie identities, authenticated sessions are opaque hashed
tokens, and admin routes require the server-side `admin` profile role. The
frontend no longer reads or writes Community localStorage.

### Open provider gate — Sign in with Apple secrets and callback

The Worker implements Apple authorization-code exchange, hashed state/nonce
records, Apple JWKS verification, profile upsert, anonymous claim-later and
opaque session creation. The five required secrets and Apple Service ID/return
URL still need to be configured and tested in the target Cloudflare account.
Never accept a browser-supplied role or user id.

### Closed in code — anonymous abuse controls

The API applies body-size and field-length caps, same-origin checks, D1-backed
per-identity rate-limit buckets, allowlists, report intake and server-side
moderation. Turnstile is intentionally not enabled by this task; it can be
added later only as a separate abuse-risk decision.

### Closed — local browser state is user-controlled

Community data is now returned by the Worker and D1. The browser holds only
opaque cookies and transient UI state.

## Controls required before production backend launch

- Server-side opaque anonymous identity; no fingerprinting and no IP-based canonical identity.
- Separate unique vote constraints for authenticated and anonymous identity, plus an exactly-one-identity check.
- Transactional claim-later and duplicate merge operations.
- D1 query boundaries for public reads, own activity, signed-in comments and admin-only moderation.
- Output escaping/sanitisation and content reports.
- HttpOnly, SameSite cookies, CSRF/origin validation and rate limits.
- Audit trail for status changes, merges, hides, deletes and role changes.
- Meaningful-only follower notifications; no health data or third-party ad tracking.

## Conclusion

The implementation is ready for a controlled Worker deployment once the target
Cloudflare token has D1/Workers permissions and the Apple secrets are set. The
“Under construction” notice remains intentionally visible until those live
provider gates and browser verification are complete.
