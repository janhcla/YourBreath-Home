# YourBreath website performance and SEO notes

## Biggest performance problem identified

The original site loads:

- Tailwind from a browser CDN
- React packages from esm.sh importmaps
- fonts directly during render
- a very large single App.tsx file

This increases render blocking and slows first-load performance.

## Improvements introduced in this PR

- Removed runtime React importmaps
- Added proper SEO metadata
- Added robots.txt
- Added sitemap.xml
- Added structured data (Schema.org)
- Added OpenGraph and Twitter metadata
- Added social preview image
- Added canonical URL
- Enabled indexing via robots meta tag

## Important note about Tailwind

The Tailwind CDN runtime dependency is intentionally still present.

It was temporarily restored to avoid breaking the UI before a proper build-time Tailwind/PostCSS pipeline is implemented.

## Recommended next steps

### High priority

1. Split App.tsx into:

- components/
- views/
- hooks/
- animations/

2. Move Tailwind into proper build pipeline:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. Create:

- src/main.tsx
- src/App.tsx
- src/components/
- src/styles/

4. Self-host fonts or use variable font loading.

5. Compress animations and reduce blur layers.

### SEO

Submit these to Google Search Console:

- https://yourbreath.pages.dev/sitemap.xml
- https://yourbreath.pages.dev/

### Best long-term improvement

Move from pages.dev subdomain to:

- yourbreath.app
- yourbreath.io

A custom domain typically indexes faster and ranks better.
