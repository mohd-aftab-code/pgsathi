import { google } from "googleapis";
import fs from "fs";
import path from "path";

interface Credentials {
  clientEmail: string;
  privateKey: string;
}

/**
 * Resolves credentials from either:
 * 1. google-service-account.json or service-account.json file in root
 * 2. GOOGLE_SERVICE_ACCOUNT_JSON env variable (raw JSON string)
 * 3. GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY env variables
 */
function resolveCredentials(): { creds: Credentials | null; source: string | null } {
  // Option 1: File in project root
  const rootDir = process.cwd();
  const fileCandidates = [
    path.join(rootDir, "google-service-account.json"),
    path.join(rootDir, "service-account.json"),
  ];

  for (const filePath of fileCandidates) {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(fileContent);
        if (parsed.client_email && parsed.private_key) {
          return {
            creds: {
              clientEmail: parsed.client_email,
              privateKey: parsed.private_key,
            },
            source: path.basename(filePath),
          };
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  // Option 2: Full JSON string in env
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      if (parsed.client_email && parsed.private_key) {
        return {
          creds: {
            clientEmail: parsed.client_email,
            privateKey: parsed.private_key,
          },
          source: "GOOGLE_SERVICE_ACCOUNT_JSON",
        };
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  // Option 3: Individual ENV variables
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY?.trim();

  if (clientEmail && rawPrivateKey) {
    const cleanKey = rawPrivateKey.replace(/\\n/g, "\n").replace(/\r/g, "");
    return {
      creds: {
        clientEmail,
        privateKey: cleanKey,
      },
      source: "ENV_VARS",
    };
  }

  return { creds: null, source: null };
}

/**
 * Checks whether Google Indexing credentials are configured.
 */
export function isIndexingConfigured(): { configured: boolean; email?: string; source?: string } {
  const { creds, source } = resolveCredentials();
  if (creds && creds.clientEmail && creds.privateKey) {
    return {
      configured: true,
      email: creds.clientEmail,
      source: source || "unknown",
    };
  }
  return { configured: false };
}

/**
 * Returns the Service Account Email to be added in Google Search Console
 */
export function getServiceAccountEmail(): string | null {
  const { creds } = resolveCredentials();
  return creds?.clientEmail || null;
}

/**
 * Initializes the Google Indexing API client
 */
const getIndexingClient = () => {
  const { creds } = resolveCredentials();
  if (!creds) {
    console.warn("[GoogleIndexing] Credentials missing. Set GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY or provide google-service-account.json");
    return null;
  }

  try {
    const jwtClient = new google.auth.JWT({
      email: creds.clientEmail,
      key: creds.privateKey,
      scopes: [
        "https://www.googleapis.com/auth/indexing",
        "https://www.googleapis.com/auth/webmasters",
      ],
    });
    return jwtClient;
  } catch (error: any) {
    console.error("[GoogleIndexing] Error initializing JWT client:", error?.message || error);
    return null;
  }
};

/**
 * Pings Google Indexing API to notify about a new, updated, or deleted URL
 * @param url The exact URL to be indexed or removed
 * @param type "URL_UPDATED" | "URL_DELETED"
 */
export async function notifyGoogleIndexingAPI(
  url: string,
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const jwtClient = getIndexingClient();

    if (!jwtClient) {
      return { success: false, error: "Google credentials not configured" };
    }

    await jwtClient.authorize();

    const indexing = google.indexing({
      version: "v3",
      auth: jwtClient,
    });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    });

    console.log(`[GoogleIndexing] Success for ${url} [${type}]`);
    return { success: true, data: response.data };
  } catch (error: any) {
    const errMsg = error?.response?.data?.error?.message || error?.message || "Unknown error";
    console.error(`[GoogleIndexing] Failed for ${url}:`, errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Batch pings Google Indexing API for an array of URLs with rate limiting
 */
export async function batchNotifyGoogleIndexingAPI(
  urls: string[],
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED",
  batchSize: number = 10
): Promise<{ total: number; succeeded: number; failed: number; results: any[] }> {
  const results: any[] = [];
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i += batchSize) {
    const chunk = urls.slice(i, i + batchSize);
    const chunkPromises = chunk.map(async (url) => {
      const res = await notifyGoogleIndexingAPI(url, type);
      return { url, ...res };
    });

    const chunkResults = await Promise.allSettled(chunkPromises);

    for (const item of chunkResults) {
      if (item.status === "fulfilled") {
        results.push(item.value);
        if (item.value.success) succeeded++;
        else failed++;
      } else {
        results.push({ success: false, error: item.reason?.message });
        failed++;
      }
    }

    // Small delay between batches to respect Google API quota limits
    if (i + batchSize < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return {
    total: urls.length,
    succeeded,
    failed,
    results,
  };
}

/**
 * Pings Google and search engines that the sitemap has been updated
 */
export async function pingSitemapToSearchEngines(sitemapUrl?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in";
  const targetSitemap = sitemapUrl || `${baseUrl}/sitemap.xml`;

  const endpoints = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(targetSitemap)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(targetSitemap)}`,
  ];

  const results = await Promise.allSettled(
    endpoints.map(async (ep) => {
      try {
        const res = await fetch(ep, { method: "GET", signal: AbortSignal.timeout(4000) });
        return { endpoint: ep, status: res.status, ok: res.ok };
      } catch (e: any) {
        return { endpoint: ep, error: e?.message };
      }
    })
  );

  return results.map((r, i) => ({
    target: endpoints[i],
    status: r.status,
    result: r.status === "fulfilled" ? r.value : null,
  }));
}
