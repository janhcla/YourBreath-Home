# Deployment and custom-domain handoff

## Current published URL

The migrated public Worker is:

`https://feedback.yourbreath.app`

The Cloudflare Worker is named `yourbreath-community` and is bound to the
European D1 database `yourbreath-community` through `DB`.

## DNS migration record

Before migration, `feedback.yourbreath.app` was a DNS-only CNAME to
`custom-domains.chatgpt.site`. That exact CNAME was removed after the Worker
deployment was verified. Cloudflare then created the proxied custom-domain
record for the Worker and issued the certificate.

The two existing Sites TXT verification records were preserved:

| Type | Name | Value |
|---|---|---|
| TXT | `_openai-site-verification.feedback` | `openai-site-verification=yURStLnntK-Nkchu7w_clwGD-hNpDySihfqdWN_krXU` |
| TXT | `_cf-custom-hostname.feedback` | `b190c28b-37a7-4d5d-ba6c-b7636ab3deec` |

No A or AAAA record was manually added. Cloudflare owns the custom-domain
record and TLS termination.

## Marketing-site integration

The exact copy and link plan is in `docs/marketing-integration.md`. The existing `yourbreath.app` source was not changed in this checkpoint because it is not available as a local Sites checkout in this workspace. Apply that compact section after the custom domain is active, keeping the app Privacy Policy and Community Privacy Notice as separate links.

## Production backend gate

The two Drizzle migrations are applied to the new D1 database. The current
front-end checkpoint still uses browser-local state and its sign-in/admin
controls are preview-only. Do not communicate synchronized voting, public
submission persistence, authenticated comments/follows, or server-side
moderation as live until the API, identity, rate limits and authorization
controls are implemented.
