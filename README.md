# YourBreath website

Marketing, privacy, terms, and support site for YourBreath.

Production: https://yourbreath.app

Hosting: Cloudflare Pages, synced directly from GitHub.

## Run Locally

Prerequisite: Node.js 22.12.0 or newer. The repository includes `.nvmrc` for local and Cloudflare Pages builds.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
3. Build the production bundle:
   ```bash
   npm run build
   ```

Cloudflare Pages should use `npm run build` as the build command and `dist` as the output directory.
For manual deploys, use:

```bash
npm run deploy
```

Do not use `npx wrangler deploy` here; that targets Workers, not this Pages site.

## YourBreath Community

The public feedback site is maintained separately under [`community/`](community/)
and deploys as the Cloudflare Worker `yourbreath-community` at
<https://feedback.yourbreath.app>. It has its own Worker/D1 configuration and
does not replace the `yourbreath` Pages project that serves this marketing
site. GitHub Actions deploys Community changes from `main` when the
`CLOUDFLARE_API_TOKEN` repository secret is configured with Workers Scripts and
D1 permissions.
