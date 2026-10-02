const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

// Search terms tuned for common Indian/international bank & payment alerts.
// Narrowing here at the Gmail search level keeps us from downloading the
// user's whole inbox before running the (cheap) local classifier.
const TRANSACTION_QUERY = [
  "subject:(debited OR credited OR transaction OR payment OR receipt OR invoice",
  "OR \"order confirmed\" OR \"has been debited\" OR \"has been credited\"",
  "OR statement OR refund OR \"payment successful\" OR \"amount deducted\")",
].join(" ");

interface GmailListResponse {
  messages?: { id: string; threadId: string }[];
  nextPageToken?: string;
}

interface GmailMessagePart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailMessagePart[];
}

interface GmailMessage {
  id: string;
  snippet: string;
  internalDate: string;
  payload?: GmailMessagePart & {
    headers?: { name: string; value: string }[];
  };
}

async function gmailFetch(accessToken: string, path: string) {
  const res = await fetch(`${GMAIL_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Gmail API error (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export async function listTransactionMessageIds(
  accessToken: string,
  maxResults = 50
): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q: TRANSACTION_QUERY,
      maxResults: String(Math.min(maxResults - ids.length, 100)),
    });
    if (pageToken) params.set("pageToken", pageToken);

    const data: GmailListResponse = await gmailFetch(accessToken, `/messages?${params}`);
    ids.push(...(data.messages ?? []).map((m) => m.id));
    pageToken = data.nextPageToken;
  } while (pageToken && ids.length < maxResults);

  return ids.slice(0, maxResults);
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf-8");
}

function extractPlainText(part?: GmailMessagePart): string {
  if (!part) return "";

  if (part.mimeType === "text/plain" && part.body?.data) {
    return decodeBase64Url(part.body.data);
  }
  if (part.mimeType === "text/html" && part.body?.data) {
    // Strip tags for a rough plain-text fallback when no text/plain part exists.
    return decodeBase64Url(part.body.data).replace(/<[^>]+>/g, " ");
  }
  if (part.parts) {
    return part.parts.map(extractPlainText).join("\n");
  }
  return "";
}

export interface FetchedMessage {
  id: string;
  subject: string;
  from: string;
  receivedAt: Date;
  snippet: string;
  bodyText: string;
}

export async function getMessage(accessToken: string, id: string): Promise<FetchedMessage> {
  const msg: GmailMessage = await gmailFetch(accessToken, `/messages/${id}?format=full`);

  const headers = msg.payload?.headers ?? [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

  return {
    id: msg.id,
    subject: getHeader("Subject"),
    from: getHeader("From"),
    receivedAt: new Date(Number(msg.internalDate)),
    snippet: msg.snippet,
    bodyText: extractPlainText(msg.payload),
  };
}
