import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://yourbreath.pages.dev';
const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');

const routes = [
  {
    path: '/',
    title: 'YourBreath - Private breathing app for iPhone and Apple Watch',
    description:
      'YourBreath helps you start a calm breathing session on iPhone or Apple Watch. No account, no ads, no analytics.',
    keywords:
      'YourBreath, breathing app, Apple Watch breathing app, iPhone breathing app, private breathing app, no ads, no analytics, box breathing, 4-7-8 breathing',
    heading: 'YourBreath',
    body:
      'YourBreath is a private breathing app for iPhone and Apple Watch. Start Box Breathing or 4-7-8 breathing quickly, use visual cues, sound or haptics, and keep breathing sessions on your device. No account, no ads, no third-party analytics and no subscription pressure.'
  },
  {
    path: '/about/',
    title: 'About YourBreath - Private breathing app by Jan H. Clausen',
    description:
      'YourBreath is built independently by Danish general practitioner and app developer Jan H. Clausen.',
    keywords:
      'YourBreath founder, Jan H Clausen, Danish doctor app developer, independent breathing app, privacy-first wellness app',
    heading: 'About YourBreath',
    body:
      'YourBreath is built independently by Jan H. Clausen, a Danish general practitioner and app developer. The app focuses on practical breathing sessions for everyday calm, privacy-first design, and direct Apple Watch support.'
  },
  {
    path: '/press/',
    title: 'Press - YourBreath private breathing app',
    description:
      'Press information and key facts for YourBreath, a private breathing app for iPhone and Apple Watch.',
    keywords:
      'YourBreath press, private breathing app, Apple Watch wellness app, iPhone wellness app, no account breathing app',
    heading: 'Press',
    body:
      'YourBreath is a private breathing app for iPhone and Apple Watch. Key facts: no account, no ads, no third-party analytics, free breathing patterns, Apple Watch haptic guidance and a one-time Premium unlock.'
  },
  {
    path: '/apple-watch-breathing-app/',
    title: 'Breathing app for Apple Watch - YourBreath',
    description:
      'Start short breathing sessions from your Apple Watch with calm visual cues, sound and haptics.',
    keywords:
      'Apple Watch breathing app, watchOS breathing app, haptic breathing guide, YourBreath Apple Watch',
    heading: 'Breathing app for Apple Watch',
    body:
      'YourBreath works on Apple Watch so you can start short breathing sessions from your wrist. Haptic cues help guide inhale, hold and exhale phases without needing to keep looking at the screen.'
  },
  {
    path: '/private-breathing-app/',
    title: 'Private breathing app with no account, ads or analytics - YourBreath',
    description:
      'YourBreath is a private breathing app with no account, no ads and no analytics.',
    keywords:
      'private breathing app, no account breathing app, no ads breathing app, no analytics wellness app, YourBreath privacy',
    heading: 'Private breathing app',
    body:
      'YourBreath is designed for privacy. It works without an account, without ads and without third-party analytics. Breathing sessions stay with the user.'
  },
  {
    path: '/breathing-app-without-subscription/',
    title: 'Breathing app without subscription pressure - YourBreath',
    description:
      'YourBreath is free to try and offers Premium as a one-time unlock instead of a subscription.',
    keywords:
      'breathing app without subscription, one-time purchase breathing app, no subscription breathing app, YourBreath Premium',
    heading: 'Breathing app without subscription pressure',
    body:
      'YourBreath includes free breathing patterns and offers Premium as a one-time unlock. It is built for people who want a calm breathing app without subscription pressure.'
  },
  {
    path: '/breathing-techniques/',
    title: 'Breathing techniques - Box Breathing and 4-7-8 in YourBreath',
    description:
      'Learn about the guided breathing patterns in YourBreath, including Box Breathing and 4-7-8 breathing.',
    keywords:
      'Box Breathing app, 4-7-8 breathing app, coherent breathing, physiological sigh, breathing techniques, YourBreath',
    heading: 'Breathing techniques',
    body:
      'YourBreath includes guided breathing techniques such as Box Breathing and 4-7-8 breathing. Premium adds more advanced patterns including Coherent Breathing, Periodic Sighing, Voluntary Hyperventilation and Wim Hof style routines.'
  },
  {
    path: '/privacy/',
    title: 'Privacy Policy - YourBreath',
    description:
      'YourBreath works without accounts, ads or third-party analytics. Read the privacy policy.',
    keywords:
      'YourBreath privacy policy, no tracking breathing app, no analytics breathing app',
    heading: 'Privacy Policy',
    body:
      'YourBreath is built to work without accounts, advertising or third-party analytics. The privacy policy explains how the app handles user data and HealthKit-related permissions.'
  },
  {
    path: '/terms/',
    title: 'Terms of Service - YourBreath',
    description: 'Terms of Service for the YourBreath iPhone and Apple Watch app.',
    keywords: 'YourBreath terms, YourBreath app terms, breathing app terms',
    heading: 'Terms of Service',
    body:
      'The YourBreath Terms of Service describe use of the iPhone and Apple Watch app, Premium unlocks, refunds, support and health-related disclaimers.'
  },
  {
    path: '/support/',
    title: 'Support - YourBreath',
    description: 'Support for YourBreath, Premium, refunds, HealthKit and Apple Watch.',
    keywords:
      'YourBreath support, breathing app support, Apple Watch breathing app help, HealthKit support',
    heading: 'Support',
    body:
      'Get support for YourBreath, including Apple Watch setup, HealthKit permissions, Premium, refunds, breathing sessions and app troubleshooting.'
  }
];

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const replaceTag = (html, selector, replacement) => html.replace(selector, replacement);

const buildStaticFallback = ({ heading, body }) => `
      <main class="seo-fallback" aria-label="${escapeHtml(heading)}">
        <h1>${escapeHtml(heading)}</h1>
        <p>${escapeHtml(body)}</p>
      </main>`;

const buildRouteHtml = (template, route) => {
  const canonical = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;
  const escapedTitle = escapeHtml(route.title);
  const escapedDescription = escapeHtml(route.description);
  const escapedKeywords = escapeHtml(route.keywords);
  const escapedCanonical = escapeHtml(canonical);
  const staticFallback = buildStaticFallback(route);

  let html = template;
  html = replaceTag(html, /<title>.*?<\/title>/s, `<title>${escapedTitle}</title>`);
  html = replaceTag(
    html,
    /<meta name="description" content=".*?" \/>/s,
    `<meta name="description" content="${escapedDescription}" />`
  );
  html = replaceTag(
    html,
    /<link rel="canonical" href=".*?" \/>/s,
    `<link rel="canonical" href="${escapedCanonical}" />`
  );
  html = replaceTag(
    html,
    /<meta property="og:url" content=".*?" \/>/s,
    `<meta property="og:url" content="${escapedCanonical}" />`
  );
  html = replaceTag(
    html,
    /<meta property="og:title" content=".*?" \/>/s,
    `<meta property="og:title" content="${escapedTitle}" />`
  );
  html = replaceTag(
    html,
    /<meta property="og:description" content=".*?" \/>/s,
    `<meta property="og:description" content="${escapedDescription}" />`
  );
  html = replaceTag(
    html,
    /<meta name="twitter:title" content=".*?" \/>/s,
    `<meta name="twitter:title" content="${escapedTitle}" />`
  );
  html = replaceTag(
    html,
    /<meta name="twitter:description" content=".*?" \/>/s,
    `<meta name="twitter:description" content="${escapedDescription}" />`
  );
  html = html.replace(
    '<meta name="robots" content="index, follow" />',
    `<meta name="robots" content="index, follow" />\n    <meta name="keywords" content="${escapedKeywords}" />`
  );
  html = html.replace('<div id="root"></div>', `<div id="root">${staticFallback}\n    </div>`);
  return html;
};

const template = await readFile(indexPath, 'utf8');

await Promise.all(
  routes.map(async (route) => {
    const html = buildRouteHtml(template, route);
    if (route.path === '/') {
      await writeFile(indexPath, html);
      return;
    }
    const routeDir = path.join(distDir, route.path.replace(/\/$/, ''));
    await mkdir(routeDir, { recursive: true });
    await writeFile(path.join(routeDir, 'index.html'), html);
  })
);
