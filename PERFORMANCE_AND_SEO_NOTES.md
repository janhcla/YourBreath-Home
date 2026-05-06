# YourBreath website performance and SEO notes

## Biggest performance problem fixed

The original site loaded:

- Tailwind from a browser CDN
- React packages from esm.sh importmaps
- fonts directly during render
- a very large single App.tsx file

This increases render blocking and slows first-load performance.

## Improvements introduced in this PR

- Removed runtime React importmaps
- Moved Tailwind from browser CDN generation to build-time CSS
- Self-hosted the Inter font through the Vite bundle
- Added proper SEO metadata
- Added robots.txt
- Added sitemap.xml
- Added structured data (Schema.org)
- Added OpenGraph and Twitter metadata
- Added social preview image
- Added canonical URL
- Enabled indexing via robots meta tag

## Recommended next steps

### High priority

1. Split App.tsx into:

- `components/`
- `views/`
- `hooks/`
- `animations/`

2. Compress animations and reduce blur layers.

3. Consider lazy-loading the Learn More modal content.

### SEO

Submit these to Google Search Console:

- https://yourbreath.pages.dev/sitemap.xml
- https://yourbreath.pages.dev/

### Best long-term improvement

Move from pages.dev subdomain to:

- yourbreath.app
- yourbreath.io

A custom domain typically indexes faster and ranks better.
