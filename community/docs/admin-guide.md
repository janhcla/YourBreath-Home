# Community admin guide

## Review rhythm

Start in **Needs attention**. Read new ideas for clarity and privacy, check similar ideas, then set category and status. Use **Rising** for recent activity, not only the largest vote count. Use **Duplicate candidates** to merge ideas only after comparing their intent.

## Status choices

- **New:** received but not yet assessed.
- **Under review:** actively considering product fit and feasibility.
- **Planned:** intended direction without a release promise.
- **In progress:** implementation has started.
- **Shipped:** available in a released YourBreath version or current app.
- **Not planned:** currently outside the product direction; keep the response respectful and specific.

## Public response style

Write as the developer: personal, clear and honest. Explain the real constraint where useful. Avoid promising dates unless a target has been deliberately published. Do not discuss private user data or health information.

## Moderation

Hide or remove content that includes sensitive health information, abuse, spam, personal data or unsafe claims. Lock a discussion when it no longer helps. Preserve the moderation reason and actor in the audit log. Never use a user's Premium status to prioritize or silence a suggestion.

## Merge checklist

1. Confirm the ideas describe the same underlying request.
2. Select the canonical suggestion and preserve a redirect from the merged suggestion.
3. Run the server transaction that deduplicates votes and follows.
4. Combine useful context in the canonical description and note the merge in the audit trail.
5. Re-check the public detail page and status history.
