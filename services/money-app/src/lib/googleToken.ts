/**
 * Exchanges a stored Google refresh_token for a short-lived access_token.
 * Called on-demand before each Gmail API sync rather than caching access
 * tokens, since refresh tokens rarely expire but access tokens do (~1hr).
 */
export async function getGoogleAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID as string,
      client_secret: process.env.AUTH_GOOGLE_SECRET as string,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to refresh Google access token: ${text}`);
  }

  const data = await res.json();
  return data.access_token as string;
}
