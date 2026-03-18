import * as XLSX from "xlsx";

export function indexToLetter(i: number): "A" | "B" | "C" | "D" {
  return (["A", "B", "C", "D"][i] ?? "A") as any;
}

/**
 * Build flat rows for export from questions using the new schema:
 * - lang.en / lang.hi / lang.gu
 * - each lang => Question, Option A..D, Categories (comma separated)
 * - Correct Option (A/B/C/D), Status
 * - includeBank => adds Bank column at start
 */
export function buildExportRows(questions: any[], includeBank = false) {
  return questions.map((q) => {
    // Helper to safely read a language block
    const readLang = (langBlock: any) => {
      const qText = langBlock?.text ?? "";
      const opts = Array.isArray(langBlock?.options) ? langBlock.options : [];
      const a = opts[0]?.text ?? "";
      const b = opts[1]?.text ?? "";
      const c = opts[2]?.text ?? "";
      const d = opts[3]?.text ?? "";
      const cats = Array.isArray(langBlock?.categories) ? langBlock.categories.join(", ") : "";
      return { qText, a, b, c, d, cats };
    };

    const en = readLang(q.lang?.en);
    const hi = readLang(q.lang?.hi);
    const gu = readLang(q.lang?.gu);

    const correct = indexToLetter(Number(q.correctIndex ?? 0));
    const status = q.status ?? "";

    const base: any = {
      "en.Question": en.qText,
      "en.Option A": en.a,
      "en.Option B": en.b,
      "en.Option C": en.c,
      "en.Option D": en.d,
      "en.Categories": en.cats,

      "hi.Question": hi.qText,
      "hi.Option A": hi.a,
      "hi.Option B": hi.b,
      "hi.Option C": hi.c,
      "hi.Option D": hi.d,
      "hi.Categories": hi.cats,

      "gu.Question": gu.qText,
      "gu.Option A": gu.a,
      "gu.Option B": gu.b,
      "gu.Option C": gu.c,
      "gu.Option D": gu.d,
      "gu.Categories": gu.cats,

      "Correct Option": correct,
      "Status": status,
    };

    if (includeBank) {
      return { Bank: q.bankName ?? "Unknown", ...base };
    }
    return base;
  });
}

/**
 * Convert rows to XLSX buffer. The columns order is deterministic:
 * if rows include Bank, Bank comes first, then en.*, hi.*, gu.*, Correct Option, Status
 */
export function rowsToXlsxBuffer(rows: any[], sheetName = "Sheet1"): Buffer {
  const wb = XLSX.utils.book_new();

  // build header order
  let headers: string[] = [];
  if (rows.length > 0) {
    const first = rows[0];
    // preferred order for predictable output
    const order = [
      "Bank",
      "en.Question", "en.Option A", "en.Option B", "en.Option C", "en.Option D", "en.Categories",
      "hi.Question", "hi.Option A", "hi.Option B", "hi.Option C", "hi.Option D", "hi.Categories",
      "gu.Question", "gu.Option A", "gu.Option B", "gu.Option C", "gu.Option D", "gu.Categories",
      "Correct Option", "Status",
    ];
    headers = order.filter((h) => h in first);
  } else {
    headers = [
      "en.Question", "en.Option A", "en.Option B", "en.Option C", "en.Option D", "en.Categories",
      "hi.Question", "hi.Option A", "hi.Option B", "hi.Option C", "hi.Option D", "hi.Categories",
      "gu.Question", "gu.Option A", "gu.Option B", "gu.Option C", "gu.Option D", "gu.Categories",
      "Correct Option", "Status",
    ];
  }

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

/**
 * Convert rows to CSV buffer using same column order as XLSX helper
 */
export function rowsToCsvBuffer(rows: any[]): Buffer {
  // Reuse rowsToXlsxBuffer header selection logic by creating a worksheet then converting to CSV
  const headers = (() => {
    if (rows.length === 0) {
      return [
        "en.Question", "en.Option A", "en.Option B", "en.Option C", "en.Option D", "en.Categories",
        "hi.Question", "hi.Option A", "hi.Option B", "hi.Option C", "hi.Option D", "hi.Categories",
        "gu.Question", "gu.Option A", "gu.Option B", "gu.Option C", "gu.Option D", "gu.Categories",
        "Correct Option", "Status",
      ];
    }
    const first = rows[0];
    const order = [
      "Bank",
      "en.Question", "en.Option A", "en.Option B", "en.Option C", "en.Option D", "en.Categories",
      "hi.Question", "hi.Option A", "hi.Option B", "hi.Option C", "hi.Option D", "hi.Categories",
      "gu.Question", "gu.Option A", "gu.Option B", "gu.Option C", "gu.Option D", "gu.Categories",
      "Correct Option", "Status",
    ];
    return order.filter((h) => h in first);
  })();

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  const csv = XLSX.utils.sheet_to_csv(ws, { FS: "," });
  return Buffer.from(csv, "utf8");
}

export function sanitizeFilename(name: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "");
  return `${name}`.replace(/[^\w\-]+/g, "_") + "_" + stamp;
}