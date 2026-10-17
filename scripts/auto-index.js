/**
 * scripts/auto-index.js
 *
 * Fully automated script to index all PGSathi URLs with Google Indexing API
 * and ping Google & Bing with the latest sitemap.
 *
 * Usage:
 *   node scripts/auto-index.js
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');

// 1. Simple zero-dependency .env loader
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const f of envFiles) {
    const fullPath = path.join(process.cwd(), f);
    if (fs.existsSync(fullPath)) {
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

// 2. Resolve Google Credentials
function getCredentials() {
  const root = process.cwd();
  const fileCandidates = [
    path.join(root, 'google-service-account.json'),
    path.join(root, 'service-account.json'),
  ];

  for (const fp of fileCandidates) {
    if (fs.existsSync(fp)) {
      try {
        const raw = JSON.parse(fs.readFileSync(fp, 'utf8'));
        if (raw.client_email && raw.private_key) {
          return { email: raw.client_email, key: raw.private_key, source: path.basename(fp) };
        }
      } catch (e) {
        // Ignore
      }
    }
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const raw = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      if (raw.client_email && raw.private_key) {
        return { email: raw.client_email, key: raw.private_key, source: 'GOOGLE_SERVICE_ACCOUNT_JSON' };
      }
    } catch (e) {}
  }

  const email = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const key = process.env.GOOGLE_PRIVATE_KEY?.trim();
  if (email && key) {
    return {
      email,
      key: key.replace(/\\n/g, '\n').replace(/\r/g, ''),
      source: 'ENV (GOOGLE_CLIENT_EMAIL)',
    };
  }

  return null;
}

// 3. Ping Sitemap to Search Engines
async function pingSitemaps(sitemapUrl) {
  console.log(`\n📡 Pinging Sitemap (${sitemapUrl}) to Search Engines...`);
  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  for (const target of targets) {
    try {
      const res = await fetch(target, { signal: AbortSignal.timeout(4000) });
      console.log(`  ✓ Ping sent to ${new URL(target).hostname} (Status: ${res.status})`);
    } catch (err) {
      console.log(`  ℹ Ping notice for ${new URL(target).hostname}: ${err.message || 'Timed out (Google recommends Search Console sitemap submission)'}`);
    }
  }
}

async function main() {
  console.log('====================================================');
  console.log('   PGSATHI AUTOMATED GOOGLE INDEXER');
  console.log('====================================================\n');

  const creds = getCredentials();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in';

  if (!creds) {
    console.warn('⚠️  WARNING: Google Indexing credentials NOT detected.');
    console.warn('   To enable automatic indexing:');
    console.warn('   1. Place "google-service-account.json" in the project root');
    console.warn('      OR set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env');
    console.warn('   2. Add the service account email as "Owner" in Google Search Console:\n');
    console.warn('   -> https://search.google.com/search-console/users?resource_id=https://pgsathi.in/\n');

    // Still ping sitemap even without indexing API credentials
    await pingSitemaps(`${baseUrl}/sitemap.xml`);
    console.log('\n[Done] Sitemap pinged. Add credentials to enable real-time URL push indexing.');
    return;
  }

  console.log(`🔑 Credentials loaded from: ${creds.source}`);
  console.log(`📧 Service Account Email:   ${creds.email}\n`);

  // Initialize JWT client
  const auth = new google.auth.JWT({
    email: creds.email,
    key: creds.key,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  await auth.authorize();
  console.log('✓ Google Auth Authorized Successfully!');

  const indexing = google.indexing({ version: 'v3', auth });

  // Connect to DB and gather URLs
  const db = new PrismaClient();
  const urlSet = new Set();

  try {
    // Core routes
    const coreRoutes = [
      '',
      '/about',
      '/contact',
      '/blog',
      '/for-owners',
      '/partner',
      '/compare',
      '/compare/pgsathi-vs-rentok',
      '/compare/pgsathi-vs-nobroker',
      '/trust-and-safety',
      '/how-it-works',
      '/faq',
    ];
    coreRoutes.forEach((r) => urlSet.add(`${baseUrl}${r}`));

    // Major city pages
    const citySlugs = ['kota', 'jaipur', 'indore', 'delhi', 'noida', 'gurugram', 'bengaluru', 'pune', 'hyderabad', 'mumbai'];
    citySlugs.forEach((city) => {
      urlSet.add(`${baseUrl}/pg-in-${city}`);
      urlSet.add(`${baseUrl}/boys-pg-in-${city}`);
      urlSet.add(`${baseUrl}/girls-pg-in-${city}`);
      urlSet.add(`${baseUrl}/coed-pg-in-${city}`);
    });

    // Active PG listings from database
    const listings = await db.listing.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, city: { select: { slug: true } }, locality: { select: { slug: true } } },
      take: 100,
    });

    listings.forEach((l) => {
      if (l.city?.slug && l.locality?.slug && l.slug) {
        urlSet.add(`${baseUrl}/pg/${l.city.slug}/${l.locality.slug}/${l.slug}`);
      }
    });

    console.log(`📋 Total URLs collected for indexing: ${urlSet.size}`);

    let count = 0;
    let succeeded = 0;
    let failed = 0;

    for (const url of urlSet) {
      count++;
      process.stdout.write(`[${count}/${urlSet.size}] Indexing: ${url} ... `);
      try {
        await indexing.urlNotifications.publish({
          requestBody: {
            url,
            type: 'URL_UPDATED',
          },
        });
        console.log('✓ OK');
        succeeded++;
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        console.log(`✗ Error: ${msg}`);
        failed++;
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    console.log('\n----------------------------------------------------');
    console.log(`🎉 Indexing complete!`);
    console.log(`   Total URLs: ${urlSet.size}`);
    console.log(`   Succeeded:  ${succeeded}`);
    console.log(`   Failed:     ${failed}`);
    console.log('----------------------------------------------------');

    await pingSitemaps(`${baseUrl}/sitemap.xml`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('Fatal error in auto-indexer:', err);
  process.exit(1);
});
