# YourBreath Community QA report

**Date:** 28 July 2026
**Surface:** Public Community, admin preview, privacy and terms routes

## Automated checks

- `npm run lint` — passed with 0 errors.
- `npm run build` — passed; Vinext produced the Sites ESM Worker artifact.
- `npm test` — passed: 1 rendered HTML test, 0 failures.
- `npm run validate:artifact` — passed.
- `npm run db:generate` — passed; 9 Drizzle tables, no pending schema changes after generation.

## Browser checks

Agent preview was opened at the internal preview URL with the cloud browser. The root title was `YourBreath Community — Help shape YourBreath`, the first viewport rendered meaningful content, and the application produced no app-related console errors. Browser-extension metadata warnings were filtered as environment noise.

Verified interaction paths:

1. Anonymous vote: vote count changed from 126 to 127, button changed to Voted, and a status toast appeared.
2. Idea detail: developer response, status timeline, comment count and anonymous comment gate rendered.
3. Optional identity: sign-in explanation rendered; local preview sign-in enabled the comment field.
4. Signed-in comment: comment was submitted and appeared as “You · Just now”.
5. Duplicate prevention: typing a matching title showed Similar ideas and “Vote for this instead”.
6. Anonymous submission: a new idea was accepted and opened in its detail state with a success toast.
7. Navigation: Roadmap, Shipped and My Activity rendered their dedicated views; local activity included the submitted idea.
8. Admin: protected-looking gate opened the preview dashboard; selecting an idea and changing status updated the editor state.
9. Policy routes: `/privacy` and `/terms` rendered their correct headings and content.

## Fidelity ledger

| Check | Evidence | Result |
|---|---|---|
| First viewport | Compact header, no oversized marketing hero, immediate ideas section | Pass |
| Palette | Soft blue/green/lavender atmosphere with dark teal text and restrained accents | Pass |
| Density | Open idea rails and purposeful surfaces, no Reddit-like dense feed | Pass |
| Copy | “Help shape YourBreath”, participation-first promise and privacy boundary present | Pass |
| Responsive rules | CSS defines 390/520/720/820 breakpoints with stacked mobile controls and single-column roadmap | Source-reviewed; live mobile resize unavailable in Browser |
| Accessibility | Semantic buttons/links/labels, `aria-pressed`, dialogs, status toasts and reduced-motion rules | Pass in source/browser smoke QA |

## Remaining QA risk

The current Sites browser tooling did not expose viewport resizing, and Playwright was not installed in the checkout, so a live 390px/768px browser capture was not possible in this run. The responsive rules were source-reviewed and the desktop preview was visually inspected. Production backend, auth callbacks, rate limits and RLS remain untested until their provider bindings are provisioned.
