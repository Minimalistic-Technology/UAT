import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();
  const transactions = await Transaction.find({ userId }).sort({ receivedAt: -1 }).lean();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Transactions");

  sheet.columns = [
    { header: "Date", key: "date", width: 20 },
    { header: "Type", key: "type", width: 10 },
    { header: "Amount", key: "amount", width: 14 },
    { header: "Currency", key: "currency", width: 10 },
    { header: "Merchant", key: "merchant", width: 30 },
    { header: "Account (last 4)", key: "accountLast4", width: 16 },
    { header: "Subject", key: "subject", width: 40 },
    { header: "From", key: "from", width: 30 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const t of transactions) {
    sheet.addRow({
      date: new Date(t.receivedAt).toLocaleString(),
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      merchant: t.merchant,
      accountLast4: t.accountLast4,
      subject: t.subject,
      from: t.from,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="transactions-${Date.now()}.xlsx"`,
    },
  });
}
