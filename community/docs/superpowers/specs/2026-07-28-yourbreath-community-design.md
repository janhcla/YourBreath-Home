# YourBreath Community Design

> This design is the implementation contract for the first published Community surface. The supplied HANDOFF is treated as the approved product direction.

## Product promise

YourBreath Community is a calm public feedback loop: people can discover, search, vote and suggest before they ever sign in. Community identity is an optional convenience layer for cross-device activity, follows and notifications. It is not a prerequisite for participation and it is not a support-ticket system.

## Visual direction

- Background: very light blue-green canvas with restrained blue, lavender and mint atmospheric shapes.
- Typography: a friendly system sans stack with generous line-height and medium-weight headings; no loud marketing display treatment.
- Navigation: compact brand lock-up, four public destinations, one clear “Suggest an idea” action, and a quiet “Sign in to Community” affordance.
- Content model: open list rails and purposeful surfaces rather than a dense dashboard or Reddit-like feed.
- Suggestion cards: mobile-first rows with a left vote control, title/description, category, status and activity metadata.
- Statuses: text labels plus distinct tint and icon treatment so status never relies on colour alone.
- Motion: short vote confirmation and gentle section transitions; all motion is disabled under `prefers-reduced-motion`.

## Public experience

The primary screen opens directly on ideas. The first viewport contains “Help shape YourBreath”, the participation-first explanation, two CTAs and the first idea rows. Public navigation switches between Ideas, Roadmap, Shipped and My Activity without losing the local anonymous identity.

The MVP interaction state is browser-local and intentionally labelled as “on this device”. The UI is structured around the eventual server contract: an opaque anonymous participant id, one vote per participant/suggestion, suggestions, follows, comments and status history.

## Core states

1. Ideas: search, sort, category/status filters, vote and open details.
2. Suggest: anonymous title/description/category submission with similar-idea guidance.
3. Post-submit: confirmation plus optional sign-in/follow invitation.
4. Detail: full suggestion, developer response, timeline, follow and signed-in comment gate.
5. Roadmap: Under review, Planned and In progress columns.
6. Shipped: “You asked. We built it.” with app-version and availability context.
7. My Activity: local device activity, sign-in explanation and owned/liked items.
8. Admin: protected-looking operations surface for moderation, duplicate review and roadmap movement; real authorization remains server-side work.

## Data and privacy boundary

Community never receives YourBreath sessions, HealthKit, heart rate, HRV or progress history. It only models community activity. The public form repeats the instruction not to submit medical or sensitive health information. The Community Privacy Notice and Community Terms are separate pages and are linked in the footer.

## Intentional first-release boundary

The deployed Sites runtime currently has no provisioned D1/Supabase binding in `.openai/hosting.json`, so the visible prototype uses localStorage for honest, reversible browser-local state. The production contract is documented in `docs/architecture.md`, including transactional vote/merge semantics, optional Sign in with Apple, RLS, rate limiting and notification delivery. The UI does not claim that local activity is synchronized or that sign-in is live until those bindings are configured.
