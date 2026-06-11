import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://yourbreath.app';
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
      'YourBreath is a private breathing app for iPhone and Apple Watch. Start Box Breathing or 4-7-8 breathing quickly, use visual cues, sound or haptics, and keep breathing sessions on your device. No account, no ads, no third-party analytics and no subscription pressure.',
    details: [
      'Includes Box Breathing and 4-7-8 breathing for free.',
      'Supports iPhone and Apple Watch with calm visual, sound and haptic cues.',
      'Built independently by Danish general practitioner and app developer Jan H. Clausen.'
    ]
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
      'YourBreath is built independently by Jan H. Clausen, a Danish general practitioner and app developer. The app focuses on practical breathing sessions for everyday calm, privacy-first design, and direct Apple Watch support.',
    details: [
      'The app is designed as a simple wellness tool, not a medical treatment.',
      'YourBreath works without accounts, ads or third-party analytics.',
      'Premium is offered as a one-time unlock for version 1.x.'
    ]
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
      'YourBreath is a private breathing app for iPhone and Apple Watch. Key facts: no account, no ads, no third-party analytics, free breathing patterns, Apple Watch haptic guidance and a one-time Premium unlock.',
    details: [
      'Category: health and wellness app for iPhone and Apple Watch.',
      'Business model: free to try with one-time Premium unlock.',
      'Privacy position: no account, no advertising and no third-party analytics.'
    ]
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
      'YourBreath works on Apple Watch so you can start short breathing sessions from your wrist. Haptic cues help guide inhale, hold and exhale phases without needing to keep looking at the screen.',
    details: [
      'Start quick breathing sessions directly from Apple Watch.',
      'Use haptic guidance when looking at the screen is inconvenient.',
      'Premium status, routines and haptic settings sync with the iPhone app.'
    ]
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
      'YourBreath is designed for privacy. It works without an account, without ads and without third-party analytics. Breathing sessions stay with the user.',
    details: [
      'No account is required to use the app.',
      'The app does not show ads or use third-party analytics.',
      'HealthKit access is optional and controlled by the user.'
    ]
  },
  {
    path: '/breathing-app-without-subscription/',
    title: 'Breathing App Without a Subscription | Free Forever Exercises',
    description:
      'Box Breathing and 4-7-8 Breathing stay free forever on iPhone and Apple Watch. No account, ads or analytics. Premium is a one-time unlock.',
    keywords:
      'free breathing app, breathing app without subscription, no subscription breathing app, free forever breathing exercises, one-time purchase breathing app',
    heading: 'A breathing app that stays free where it matters',
    body:
      'Box Breathing and 4-7-8 Breathing stay free forever in YourBreath on iPhone and Apple Watch. The core app is not a short free trial. Premium is an optional one-time unlock for version 1.x rather than a recurring subscription.',
    details: [
      'Box Breathing and 4-7-8 Breathing remain free after the first day, week and month.',
      'The free exercises work on both iPhone and Apple Watch.',
      'Premium unlocks deeper tools, longer routines and personal insights.',
      'Premium is a one-time unlock for version 1.x rather than a subscription.'
    ],
    faq: [
      ['Is YourBreath really free?', 'Yes. Box Breathing and 4-7-8 Breathing stay free forever on iPhone and Apple Watch.'],
      ['Does the free version expire?', 'No. The core free exercises are not a time-limited trial.'],
      ['Is Premium a subscription?', 'No. Premium is an optional one-time unlock for version 1.x.'],
      ['Do I need an account?', 'No. You can use YourBreath without creating an account.']
    ]
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
      'YourBreath includes guided breathing techniques such as Box Breathing and 4-7-8 breathing. Premium adds more advanced patterns including Coherent Breathing, Periodic Sighing, Voluntary Hyperventilation and Wim Hof style routines.',
    details: [
      'Box Breathing uses equal inhale, hold, exhale and hold phases.',
      '4-7-8 breathing uses a slower inhale, hold and exhale rhythm for winding down.',
      'Premium techniques are clearly marked as Premium in the app and on the website.'
    ]
  },
  {
    path: '/breathwork-app/',
    title: 'Breathwork App for iPhone & Apple Watch | YourBreath',
    description:
      'A private breathwork app with guided Box Breathing, 4-7-8 Breathing and Apple Watch haptics. Core exercises stay free forever.',
    keywords:
      'breathwork app, guided breathwork app, breathwork app Apple Watch, breathwork iPhone, free breathwork exercises',
    heading: 'A breathwork app built for the moment you need it',
    body:
      'YourBreath guides timed breathing patterns on iPhone and Apple Watch with visual, sound and haptic cues. Box Breathing and 4-7-8 Breathing stay free forever, with no account, ads or third-party analytics.',
    details: [
      'Start short breathwork sessions without creating an account.',
      'Use visual, sound or haptic guidance on iPhone and Apple Watch.',
      'Optional Premium is a one-time unlock for version 1.x.'
    ]
  },
  {
    path: '/mindfulness-breathing-app/',
    title: 'Mindfulness Breathing App Without Ads | YourBreath',
    description:
      'Take a quiet mindful pause with guided breathing on iPhone and Apple Watch. No account, no ads and no analytics.',
    keywords:
      'mindfulness breathing app, mindfulness app without ads, private mindfulness app, Apple Watch mindfulness breathing',
    heading: 'A mindfulness breathing app without the noise',
    body:
      'YourBreath supports short mindful pauses through guided breathing on iPhone and Apple Watch. The app works without accounts, ads, social feeds or third-party analytics.',
    details: [
      'Follow the next inhale and exhale with calm visual or haptic cues.',
      'Box Breathing and 4-7-8 Breathing stay free forever.',
      'Optional HealthKit and iCloud features remain under Apple settings.'
    ]
  },
  {
    path: '/breathing-meditation-app/',
    title: 'Simple Breathing Meditation App | YourBreath',
    description:
      'Use short guided breathing sessions as a simple meditation practice on iPhone and Apple Watch. Start without an account or subscription.',
    keywords:
      'breathing meditation app, guided breathing meditation, meditation app Apple Watch, simple meditation app, free breathing meditation',
    heading: 'Simple breathing meditation on iPhone and Apple Watch',
    body:
      'YourBreath provides a clear breathing rhythm for a simple breath-focused meditation practice. Start a quick session without an account, advertising or a recurring subscription.',
    details: [
      'Follow timed visual, sound or haptic guidance instead of watching a clock.',
      'Use quick sessions or adjust the routine and duration.',
      'Box Breathing and 4-7-8 Breathing stay free forever.'
    ]
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
      'YourBreath is built to work without accounts, advertising or third-party analytics. The privacy policy explains how the app handles user data and HealthKit-related permissions.',
    details: [
      'Breathing sessions and progress data are stored on device.',
      'HealthKit permissions are optional and can be controlled in Apple Health settings.',
      'The developer does not receive account, advertising or analytics profiles from the app.'
    ]
  },
  {
    path: '/terms/',
    title: 'Terms of Service - YourBreath',
    description: 'Terms of Service for the YourBreath iPhone and Apple Watch app.',
    keywords: 'YourBreath terms, YourBreath app terms, breathing app terms',
    heading: 'Terms of Service',
    body:
      'The YourBreath Terms of Service describe use of the iPhone and Apple Watch app, Premium unlocks, refunds, support and health-related disclaimers.',
    details: [
      'YourBreath is a wellness tool and does not replace professional healthcare.',
      'Premium purchases and refunds are handled by the Apple App Store.',
      'Users should stop if breathing exercises feel uncomfortable.'
    ]
  },
  {
    path: '/support/',
    title: 'Support - YourBreath',
    description: 'Support for YourBreath, Premium, refunds, HealthKit and Apple Watch.',
    keywords:
      'YourBreath support, breathing app support, Apple Watch breathing app help, HealthKit support',
    heading: 'Support',
    body:
      'Get support for YourBreath, including Apple Watch setup, HealthKit permissions, Premium, refunds, breathing sessions and app troubleshooting.',
    details: [
      'Find help with Premium restore, App Store refunds and Apple Watch setup.',
      'HealthKit data can be managed in the Apple Health app.',
      'Support is available by email from the app and the website.'
    ]
  }
];

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const replaceTag = (html, selector, replacement) => html.replace(selector, replacement);

const buildStaticFallback = ({ heading, body, details = [] }) => `
      <main class="seo-fallback" aria-label="${escapeHtml(heading)}">
        <h1>${escapeHtml(heading)}</h1>
        <p>${escapeHtml(body)}</p>
        <ul>
          ${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('\n          ')}
        </ul>
        <p><a href="${SITE_URL}/">YourBreath home</a></p>
      </main>`;

const buildRouteHtml = (template, route) => {
  const canonical = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;
  const escapedTitle = escapeHtml(route.title);
  const escapedDescription = escapeHtml(route.description);
  const escapedKeywords = escapeHtml(route.keywords);
  const escapedCanonical = escapeHtml(canonical);
  const staticFallback = buildStaticFallback(route);
  const faqSchema = route.faq
    ? `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: route.faq.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer
          }
        }))
      }).replaceAll('<', '\\u003c')}</script>`
    : '';

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
  if (faqSchema) {
    html = html.replace('</head>', `    ${faqSchema}\n  </head>`);
  }
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
