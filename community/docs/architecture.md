# YourBreath Community architecture notes

## Current deployment boundary

The first Sites checkpoint is a front-end-complete prototype. It uses browser-local state because the generated Sites checkout currently has no provisioned D1 or Supabase binding (`.openai/hosting.json` has `d1: null`). The UI labels this state as “on this device” and the sign-in surface says it is preview-only; it does not pretend that data is synchronized or that Apple authentication is live.

## Production target

Supabase + PostgreSQL is the preferred production backend because it provides relational persistence, PostgreSQL full-text/trigram search, optional Sign in with Apple, RLS and transactional server functions. The D1-compatible schema in `db/schema.ts` and `drizzle/0001_community.sql` records the same domain model for a Sites-native migration path.

### Identity and vote semantics

1. On first public write, the server issues a cryptographically random anonymous participant id in an HttpOnly, SameSite cookie. The browser may hold a non-sensitive local mirror only for UX; the server is canonical.
2. Anonymous votes use `(suggestion_id, anonymous_participant_id)` uniqueness. Authenticated votes use `(suggestion_id, user_id)` uniqueness. The API performs an atomic insert/delete or conflict-safe toggle.
3. A claim-later transaction moves eligible anonymous suggestions, follows and votes to the authenticated user. When both identities voted for the same suggestion, the conflict collapses to one authenticated vote.
4. IP addresses may be held transiently in rate-limit storage. They are never the canonical vote identity, never displayed, and never used for profiling.

### API boundary

- `GET /api/suggestions?q=&category=&status=&sort=` returns only public, non-hidden canonical suggestions.
- `POST /api/votes/toggle` accepts a suggestion id and server identity, validates CSRF/origin and rate limits the operation.
- `POST /api/suggestions` validates length, sanitises text, runs duplicate similarity, then stores the anonymous or authenticated author.
- `POST /api/follows/toggle` requires authenticated Community identity.
- `POST /api/comments` requires authentication, checks lock state and moderates length/content.
- `POST /api/admin/merge` runs the merge in one transaction, migrates unique votes/follows, preserves a redirect/audit record and marks the source as merged.

### Authorization and abuse

Public reads and safe anonymous writes are exposed through server operations. RLS policies allow public reads of non-hidden content, users to mutate only their own records, and admins to moderate roadmap data. Service-role credentials stay server-side. Rate limits and input caps apply to anonymous writes; CAPTCHA is only risk-triggered. HTML is escaped/sanitised before storage or rendering.

### Notifications

Only meaningful events notify followers: Planned, In progress, Shipped or a substantial developer update. Routine votes and comments are not notifications. Notification payloads contain the idea title, status change and a deep link, not app or health data.

### Custom domain

After the production binding is provisioned, add `feedback.yourbreath.app` as a Sites custom domain, publish the returned DNS CNAME, wait for validation/SSL, then update the compact Community link on `yourbreath.app`. The iOS Settings link should point to the stable root URL and does not need query parameters.
