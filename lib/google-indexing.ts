import { google } from "googleapis";

/**
 * Initializes the Google Indexing API client
 */
const getIndexingClient = () => {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  // Replace actual literal \n with newline characters for the private key
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    console.error("Google Indexing API credentials are missing from environment variables.");
    return null;
  }

  const jwtClient = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });

  return jwtClient;
};

/**
 * Pings Google Indexing API to notify about a new, updated, or deleted URL
 * @param url The exact URL to be indexed or removed
 * @param type "URL_UPDATED" | "URL_DELETED"
 */
export async function notifyGoogleIndexingAPI(url: string, type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED") {
  try {
    const jwtClient = getIndexingClient();
    
    if (!jwtClient) {
      console.warn("Skipping Google Indexing: Client could not be initialized.");
      return { success: false, error: "Missing credentials" };
    }

    // Authorize the client
    await jwtClient.authorize();

    const indexing = google.indexing({
      version: "v3",
      auth: jwtClient,
    });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: type,
      },
    });

    console.log(`Successfully notified Google Indexing API for ${url} [${type}]`);
    return { success: true, data: response.data };

  } catch (error: any) {
    console.error("Error pinging Google Indexing API:", error?.message || error);
    return { success: false, error: error?.message || "Unknown error" };
  }
}
