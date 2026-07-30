# YourBreath Community QA report

**Date:** 30 July 2026
**Surface:** D1-backed Community Worker, public API, frontend contract, admin API, privacy and terms routes

## Automated checks

- `npm run lint` — passed with 0 errors.
- `npm run build` — passed; Vinext produced the Sites ESM Worker artifact.
- `npm test` — passed: 12 Node tests, 0 failures.
- `npm run validate:artifact` — passed.
- Local D1 migration smoke test — passed: baseline plus `0002_production_backend.sql` created all 15 expected tables and seeded 10 stable suggestions.
- Local Worker API smoke test — passed: `GET /api/session` returned anonymous session state and `GET /api/suggestions` returned the seeded public ideas.

## Browser and live checks

The public Community URL was opened with the browser. The root title was
`YourBreath Community — Help shape YourBreath`, the first viewport rendered
meaningful content, and the visible “Under construction” notice was present.
The live marketing site also exposed one visible link labelled `Visit
YourBreath Community` pointing to `https://feedback.yourbreath.app/`.
Browser-extension metadata warnings were filtered as environment noise.

Verified source/API paths:

1. Public API: session, suggestions, detail, activity, anonymous suggestion, vote toggle and report routes are implemented with validation, origin checks, cookies and D1 writes.
2. Authenticated API: Apple state/nonce, opaque session, follows, comments, notifications and preferences are implemented; role checks are server-side.
3. Admin API: overview, status updates, merges and report review write status history, notifications and audit records transactionally.
4. Frontend: no Community localStorage access remains; API helpers power loading, voting, following, suggestions, comments and Apple sign-in redirect.
5. Rendered HTML: title, branding and the visible “Under construction” notice are asserted.
6. Marketing: root site test asserts the public URL and privacy-preserving Community description.

## Fidelity ledger

| Check | Evidence | Result |
|---|---|---|
| First viewport | Compact header, no oversized marketing hero, immediate ideas section | Pass |
| Palette | Soft blue/green/lavender atmosphere with dark teal text and restrained accents | Pass |
| Density | Open idea rails and purposeful surfaces, no Reddit-like dense feed | Pass |
| Copy | “Help shape YourBreath”, participation-first promise and privacy boundary present | Pass |
| Responsive rules | CSS defines 390/520/720/820 breakpoints with stacked mobile controls and single-column roadmap | Source-reviewed; live mobile resize unavailable in Browser |
| Accessibility | Semantic buttons/links/labels, `aria-pressed`, dialogs, status toasts and reduced-motion rules | Pass in source/browser smoke QA |

## Remaining release gates

GitHub Actions run `30542911232` completed successfully for the merged commit;
it applied the verified remote D1 migration and deployed the Worker. The local
Cloudflare token still authenticates Wrangler account identity but is not
authorized for D1 API access (`7403`), so local remote administration remains
unavailable. Live checks returned 200 for `/`, `/roadmap`, `/shipped`,
`/privacy` and `/terms`; anonymous `/api/session` and `/api/suggestions` also
returned 200. Apple Worker secrets are not configured: the Apple start endpoint
currently returns 503 and the admin overview correctly returns 403 for an
anonymous caller. These are provider configuration gates, not reasons to weaken
the implementation or place secrets in the repository.
