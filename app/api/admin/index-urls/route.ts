import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  isIndexingConfigured,
  getServiceAccountEmail,
  notifyGoogleIndexingAPI,
  batchNotifyGoogleIndexingAPI,
  pingSitemapToSearchEngines,
} from "@/lib/google-indexing";
import { CITY_SLUGS } from "@/constants/cities";
import { BLOG_POSTS } from "@/lib/data/blogs";

async function isAuthorized(req: NextRequest) {
  // Check API key header (for cron / external webhooks)
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (apiKey && process.env.ADMIN_API_KEY && apiKey === process.env.ADMIN_API_KEY) {
    return true;
  }
  if (apiKey && process.env.CRON_SECRET && apiKey === process.env.CRON_SECRET) {
    return true;
  }

  // Check Admin session
  const session = await auth();
  if (session?.user && session.user.role === "ADMIN") {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = isIndexingConfigured();
  const serviceEmail = getServiceAccountEmail();

  // Also count how many live URLs we currently have
  const [activeListingsCount, localitiesCount] = await Promise.all([
    db.listing.count({ where: { status: "ACTIVE" } }),
    db.locality.count({ where: { isActive: true } }),
  ]);

  return NextResponse.json({
    success: true,
    status,
    serviceAccountEmail: serviceEmail,
    counts: {
      activeListings: activeListingsCount,
      localities: localitiesCount,
      cities: CITY_SLUGS.length,
      blogs: BLOG_POSTS.length,
    },
  });
}

export async function POST(req: NextRequest) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is allowed for default index_all
  }

  const { action, urls, type = "URL_UPDATED" } = body;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in";

  // Action: Ping sitemap
  if (action === "ping_sitemap") {
    const results = await pingSitemapToSearchEngines();
    return NextResponse.json({ success: true, results });
  }

  // Action: Index all site pages automatically
  if (action === "index_all" || (!urls && !action)) {
    const urlSet = new Set<string>();

    // 1. Core static routes
    const coreRoutes = [
      "",
      "/about",
      "/contact",
      "/blog",
      "/for-owners",
      "/partner",
      "/compare",
      "/compare/pgsathi-vs-rentok",
      "/compare/pgsathi-vs-nobroker",
      "/trust-and-safety",
      "/how-it-works",
      "/faq",
    ];
    coreRoutes.forEach((r) => urlSet.add(`${baseUrl}${r}`));

    // 2. City programmatic routes
    CITY_SLUGS.forEach((slug) => {
      urlSet.add(`${baseUrl}/pg-in-${slug}`);
      urlSet.add(`${baseUrl}/boys-pg-in-${slug}`);
      urlSet.add(`${baseUrl}/girls-pg-in-${slug}`);
      urlSet.add(`${baseUrl}/coed-pg-in-${slug}`);
    });

    // 3. Blog posts
    BLOG_POSTS.forEach((post) => {
      urlSet.add(`${baseUrl}/blog/${post.id}`);
    });

    // 4. Active PG listings (fetch up to 100 recent active)
    const activeListings = await db.listing.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, city: { select: { slug: true } }, locality: { select: { slug: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    activeListings.forEach((listing) => {
      if (listing.city?.slug && listing.locality?.slug && listing.slug) {
        urlSet.add(`${baseUrl}/pg/${listing.city.slug}/${listing.locality.slug}/${listing.slug}`);
      }
    });

    const allUrls = Array.from(urlSet);

    // Batch notify Google Indexing API
    const batchResult = await batchNotifyGoogleIndexingAPI(allUrls, "URL_UPDATED", 10);
    // Also ping sitemap
    await pingSitemapToSearchEngines();

    return NextResponse.json({
      success: true,
      message: `Indexed ${batchResult.succeeded} of ${batchResult.total} URLs`,
      ...batchResult,
    });
  }

  // Action: Custom array of URLs
  if (urls && Array.isArray(urls)) {
    if (urls.length === 0) {
      return NextResponse.json({ error: "URLs array cannot be empty" }, { status: 400 });
    }

    if (urls.length > 200) {
      return NextResponse.json({ error: "Maximum 200 URLs per batch request" }, { status: 400 });
    }

    const batchResult = await batchNotifyGoogleIndexingAPI(urls, type, 10);
    return NextResponse.json({
      success: true,
      ...batchResult,
    });
  }

  // Action: Single URL
  if (body.url && typeof body.url === "string") {
    const res = await notifyGoogleIndexingAPI(body.url, type);
    return NextResponse.json(res);
  }

  return NextResponse.json({ error: "Invalid request. Provide `urls`, `url`, or `action: 'index_all'`" }, { status: 400 });
}
