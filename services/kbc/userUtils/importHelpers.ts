
import * as XLSX from "xlsx";
import { parse as parseCsv } from "csv-parse/sync";

export const IMPORT_MAX_ROWS = Number(process.env.IMPORT_MAX_ROWS ?? 500);

const SUPPORTED_MIMES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/csv",
  "application/octet-stream",
]);

export function letterToIndex(letter: string | number): number {
  const v = String(letter ?? "").trim();
  if (/^[1-4]$/.test(v)) return Number(v) - 1;
  const idx = "ABCD".indexOf(v.toUpperCase());
  if (idx === -1) throw new Error(`Invalid "Correct Option": ${letter}`);
  return idx;
}

function pick(row: any, keys: string[]) {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && String(v ?? "").trim() !== "") return v;
  }
  return undefined;
}

function K(prefix: string, key: string) {
  const p = [prefix, prefix.toLowerCase(), prefix.toUpperCase()];
  const joiners = [".", ":", "_"];
  return p.flatMap((pr) => joiners.map((j) => `${pr}${j}${key}`));
}

function parseLangBlock(row: any, langPrefix: "en" | "hi" | "gu") {
  const text = pick(row, [...K(langPrefix, "Question"), ...K(langPrefix, "Text")]);
  if (text === undefined) return undefined;

  const optA = pick(row, [...K(langPrefix, "Option A"), ...K(langPrefix, "A")]);
  const optB = pick(row, [...K(langPrefix, "Option B"), ...K(langPrefix, "B")]);
  const optC = pick(row, [...K(langPrefix, "Option C"), ...K(langPrefix, "C")]);
  const optD = pick(row, [...K(langPrefix, "Option D"), ...K(langPrefix, "D")]);

  const optionTexts = [optA, optB, optC, optD].map((v, i) => {
    const t = String(v ?? "").trim();
    if (!t) throw new Error(`${langPrefix}: Option ${"ABCD"[i]} missing`);
    return t;
  });

  const options = optionTexts.map((t) => ({ text: t })); // no media
  const catRaw = pick(row, [...K(langPrefix, "Category"), ...K(langPrefix, "Categories")]) ?? "";
  const categories = String(catRaw).split(",").map((s) => s.trim()).filter(Boolean);

  return { text: String(text).trim(), options, categories };
}

function parseLegacyEN(row: any) {
  const text = pick(row, ["Question", "question", "Text"]);
  if (text === undefined) return undefined;

  const optionsRaw = [
    pick(row, ["Option A", "A"]),
    pick(row, ["Option B", "B"]),
    pick(row, ["Option C", "C"]),
    pick(row, ["Option D", "D"]),
  ];
  const options = optionsRaw.map((v, i) => {
    const t = String(v ?? "").trim();
    if (!t) throw new Error(`Option ${"ABCD"[i]} missing`);
    return { text: t };
  });

  const categories = String(pick(row, ["Category", "Categories"]) ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);

  return { text: String(text).trim(), options, categories };
}

/** Normalize ONE row to the shape expected by the importer (no bankId here) */
export function normalizeRow(row: any) {
  // from Excel
  const correctIndex = (() => {
    const v = pick(row, ["Correct Index", "Correct Option", "Correct", "Answer"]);
    if (v === undefined) throw new Error("Missing 'Correct Option' column");
    return letterToIndex(v);
  })();

  const statusRaw = String(pick(row, ["Status"]) ?? "draft").toLowerCase();
  const status: "draft" | "published" = statusRaw === "published" ? "published" : "draft";

  const en = parseLangBlock(row, "en") ?? parseLegacyEN(row);
  if (!en) throw new Error("English block missing.");
  const hi = parseLangBlock(row, "hi");
  const gu = parseLangBlock(row, "gu");

  return {
    lang: { en, ...(hi ? { hi } : {}), ...(gu ? { gu } : {}) },
    correctIndex,
    status,
  };
}

function readFirstSheetToJson(buffer: Buffer) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
}
function parseCsvBuffer(buffer: Buffer) {
  const csvText = buffer.toString("utf8");
  return parseCsv(csvText, { columns: true, skip_empty_lines: true, trim: true });
}
function getExt(filename?: string) {
  const n = (filename || "").toLowerCase();
  if (n.endsWith(".xlsx")) return "xlsx";
  if (n.endsWith(".xls")) return "xls";
  if (n.endsWith(".csv")) return "csv";
  return "";
}

export function parseInputData(buffer: Buffer, mimetype?: string, originalname?: string): any[] {
  if (!buffer || buffer.length === 0) throw new Error("Empty file buffer");

  const mimeOk = mimetype && SUPPORTED_MIMES.has(mimetype);
  const ext = getExt(originalname);

  const useXlsx = mimeOk
    ? mimetype?.includes("spreadsheetml") || mimetype === "application/vnd.ms-excel"
    : ext === "xlsx" || ext === "xls";
  const useCsv = mimeOk
    ? mimetype?.includes("csv") || mimetype === "text/csv"
    : ext === "csv";

  if (useXlsx) return readFirstSheetToJson(buffer);
  if (useCsv) return parseCsvBuffer(buffer);

  try { return readFirstSheetToJson(buffer); }
  catch { try { return parseCsvBuffer(buffer); } catch { throw new Error("Unsupported file format"); } }
}
