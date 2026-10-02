import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { getGoogleAccessToken } from "@/lib/googleToken";
import { listTransactionMessageIds, getMessage } from "@/lib/gmail";
import { looksLikeTransaction, parseTransactionEmail } from "@/lib/transactionParser";

export async function POST() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user?.refreshToken) {
    return NextResponse.json(
      { error: "No Gmail access. Please sign out and sign in again to grant permission." },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getGoogleAccessToken(user.refreshToken);
    const messageIds = await listTransactionMessageIds(accessToken, 50);

    let created = 0;
    let skipped = 0;

    for (const id of messageIds) {
      const exists = await Transaction.exists({ gmailMessageId: id });
      if (exists) {
        skipped++;
        continue;
      }

      const message = await getMessage(accessToken, id);
      const fullText = `${message.subject}\n${message.bodyText || message.snippet}`;

      if (!looksLikeTransaction(fullText)) {
        skipped++;
        continue;
      }

      const parsed = parseTransactionEmail(fullText);

      await Transaction.create({
        userId: user._id,
        gmailMessageId: message.id,
        subject: message.subject,
        from: message.from,
        receivedAt: message.receivedAt,
        snippet: message.snippet,
        ...parsed,
      });
      created++;
    }

    return NextResponse.json({ created, skipped, scanned: messageIds.length });
  } catch (err) {
    console.error("Gmail sync failed:", err);
    const message = err instanceof Error ? err.message : "Gmail sync failed";
    const needsReauth = message.includes("invalid_grant");
    return NextResponse.json(
      {
        error: needsReauth
          ? "Gmail access has expired. Please sign out and sign in again to grant permission."
          : message,
      },
      { status: needsReauth ? 400 : 502 }
    );
  }
}
