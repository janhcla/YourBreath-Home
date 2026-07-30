# YourBreath Community security review

## Scope

This review covers the published front-end prototype and the documented production data contract.

## Findings

### High — production persistence and authorization are not provisioned

`.openai/hosting.json` currently has no D1 binding and no Supabase connection. The visible app therefore uses localStorage and explicitly labels sign-in/admin behavior as preview-only. Do not launch anonymous voting, public submissions or admin moderation as a production service until server operations, database authorization and abuse controls are connected.

### High — Sign in with Apple is not live

The “Sign in with Apple” action currently represents the intended production flow locally. Before production use, configure the callback, nonce/state validation, account-linking and claim-later transaction. Never accept a browser-supplied role or user id.

### Medium — anonymous abuse controls are documented but not active

The production API must add request limits, input caps, sanitisation, moderation queues and risk-triggered challenge handling. The current local preview cannot provide meaningful abuse protection.

### Low — local browser state is user-controlled

This is intentional for the preview and is never a canonical vote count or admin source. Replace it with server responses before communicating synchronized counts or cross-device activity.

## Controls required before production backend launch

- Server-side opaque anonymous identity; no fingerprinting and no IP-based canonical identity.
- Separate unique vote constraints for authenticated and anonymous identity, plus an exactly-one-identity check.
- Transactional claim-later and duplicate merge operations.
- RLS policies for public reads, own activity, signed-in comments and admin-only moderation.
- Output escaping/sanitisation and content reports.
- HttpOnly, SameSite cookies, CSRF/origin validation and rate limits.
- Audit trail for status changes, merges, hides, deletes and role changes.
- Meaningful-only follower notifications; no health data or third-party ad tracking.

## Conclusion

The front-end is safe to share as a clearly labelled prototype checkpoint. It is not yet a production community backend. The deployment must remain in prototype/feedback mode until the high findings are closed.
