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

The root marketing source now contains a compact, accessible Community section in
`../App.tsx` linking to `https://feedback.yourbreath.app`. It describes ideas,
votes and the public roadmap and explicitly keeps breathing sessions and
HealthKit data separate.

## Production backend gate

`community/drizzle/0002_production_backend.sql` adds sessions, Apple auth state,
notifications, audit records, preferences and rate-limit events. The deployment
workflow runs the idempotent `scripts/apply-production-migration.sh`, which
checks for `profiles.apple_subject` before applying the single production
migration. It does not replay the original baseline SQL.

Required Worker secrets (values never belong in git or chat):

- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_CLIENT_ID`
- `APPLE_PRIVATE_KEY`
- `COMMUNITY_ADMIN_APPLE_SUBJECT`

The first four enable Sign in with Apple; the last one selects the verified
Apple subject allowed to administer Community. Until those secrets are set and
an Apple callback is tested, the public anonymous feedback loop can run but
sign-in and admin remain intentionally unavailable.

Configure the Apple Services ID with this exact return URL before testing:

`https://feedback.yourbreath.app/api/auth/apple/callback`

Set the Worker secrets from a terminal in this directory; Wrangler reads each
value interactively and does not write it to the repository:

```sh
npx wrangler secret put APPLE_TEAM_ID --name yourbreath-community
npx wrangler secret put APPLE_KEY_ID --name yourbreath-community
npx wrangler secret put APPLE_CLIENT_ID --name yourbreath-community
npx wrangler secret put APPLE_PRIVATE_KEY --name yourbreath-community < /secure/path/AuthKey_XXXXXXXXXX.p8
npx wrangler secret put COMMUNITY_ADMIN_APPLE_SUBJECT --name yourbreath-community
```

The Cloudflare token used for these commands needs permission to edit Worker
secrets. After configuration, `/api/auth/apple/start` should redirect to
Apple, and a real Apple callback should be used to verify the user session and
the server-side admin role.
