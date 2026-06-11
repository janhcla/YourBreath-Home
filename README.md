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
