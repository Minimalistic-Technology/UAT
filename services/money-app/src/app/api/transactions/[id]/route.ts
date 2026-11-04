import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { TRANSACTION_CATEGORIES, TransactionCategory } from "@/lib/categories";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { status, category } = body as {
    status?: "new" | "pending" | "categorized";
    category?: TransactionCategory | null;
  };

  if (status && !["new", "pending", "categorized"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (status === "categorized" && !category) {
    return NextResponse.json(
      { error: "A category is required to categorize a transaction" },
      { status: 400 }
    );
  }

  if (category != null && !TRANSACTION_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  await connectToDatabase();
  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, userId },
    {
      ...(status ? { status } : {}),
      ...(category !== undefined ? { category } : {}),
    },
    { new: true }
  ).lean();

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json({ transaction });
}
