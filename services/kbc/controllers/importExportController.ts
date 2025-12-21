import Question from "../models/Question";
import QuestionBank from "../models/QuestionBank"; 
import mongoose from "mongoose";

import {
  buildExportRows,
  rowsToXlsxBuffer,
  rowsToCsvBuffer,
  sanitizeFilename,
} from "../userUtils/exportHelpers";

type Status = "published" | "draft" | "all";
type Format = "csv" | "excel" | "xlsx";

import type { Request, Response } from "express";
import ImportJob from "../models/ImportJob";
import { IMPORT_MAX_ROWS, parseInputData, normalizeRow } from "../userUtils/importHelpers";
import { importQuestionsFromJSON } from "../userUtils/importQuestions";

export const importQuestions = async (req: Request, res: Response) : Promise<void> => {
  try {
    if (!req.file){  res.status(400).json({ error: "File required" })
      return;};

    // ✅ ONLY here (params/body), not from Excel
    const bankId = (req.params.bankId as string) || (req.body.bankId as string);
    if (!bankId) { res.status(400).json({ error: "bankId required (params or body)" }); return; }
    if (!mongoose.isValidObjectId(bankId)) { res.status(400).json({ error: "Invalid bankId" }); return; }

    const rawRows = parseInputData(req.file.buffer, req.file.mimetype, req.file.originalname)
      .filter((r: any) => Object.values(r).some((v) => String(v ?? "").trim() !== ""));
    if (rawRows.length === 0) { res.status(400).json({ error: "No data rows found" }); return; }

    // Excel -> { lang:{en,hi?,gu?}, correctIndex, status }
    const rows = rawRows.map(normalizeRow);

    if (rows.length > IMPORT_MAX_ROWS) {
      const job = await ImportJob.create({ status: "processing", totalRows: rows.length, bankId });
      importQuestionsFromJSON(rows, job._id.toString(), bankId); // fire-and-forget
       res.json({ message: "Import started in background", jobId: job._id });
      return;
    }

    const report = await importQuestionsFromJSON(rows, undefined, bankId);
    res.json({ report });
  } catch (err: any) {
    console.error("Import error:", err);
    res.status(500).json({ error: err.message ?? "Import failed" });
  }
};

export const exportQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const bankId = (req.query.bankId as string)?.toLowerCase();
    const status = (req.query.status as string)?.toLowerCase() || "all";
    const format = (req.query.format as string)?.toLowerCase() || "csv";

    if (!bankId) {
       res.status(400).json({ error: "bankId required (specific ID or 'all')" });
      return;
    }

    if (!["csv", "xlsx", "excel", "json"].includes(format)) {
       res.status(400).json({ error: "Invalid format (csv, xlsx, json allowed)" });
      return;
    }

    const statusFilter: any = status !== "all" ? { status } : {};

    let questions: any[] = [];
    let filenamePrefix = "";

    // ALL banks
    if (bankId === "all") {
      const banks = await QuestionBank.find({ enabled: true }).select({ _id: 1, name: 1 }).lean();

      const all = await Question.find({
        deleted: { $ne: true },
        ...statusFilter,
      })
        .select({
          bankId: 1,
          lang: 1,
          correctIndex: 1,
          status: 1,
        })
        .lean();

      const bankNameMap = new Map(banks.map((b) => [b._id.toString(), b.name]));
      questions = all.map((q) => ({ ...q, bankName: bankNameMap.get(String(q.bankId)) || "Unknown" }));

      filenamePrefix = "all_banks";
    } else {
      // Single bank
      if (!mongoose.isValidObjectId(bankId)) {
         res.status(400).json({ error: "Invalid bankId" });
        return;
      }

      const bank = await QuestionBank.findById(bankId).select({ name: 1 }).lean().catch(() => null);
      const bankName = bank?.name || `bank_${bankId.slice(-6)}`;

      questions = await Question.find({
        bankId: new mongoose.Types.ObjectId(bankId),
        deleted: { $ne: true },
        ...statusFilter,
      })
        .select({
          lang: 1,
          correctIndex: 1,
          status: 1,
        })
        .lean();

      // attach consistent bankName for downstream
      questions = questions.map((q) => ({ ...q, bankName }));
      filenamePrefix = bankName;
    }

    // Build rows (include Bank column if exporting multiple banks)
    const includeBank = bankId === "all";
    const rows = buildExportRows(questions, includeBank);
    const baseName = sanitizeFilename(`${filenamePrefix}_${status}_questions`);

    if (format === "json") {
      res
        .setHeader("Content-Type", "application/json")
        .setHeader("Content-Disposition", `attachment; filename="${baseName}.json"`)
        .send(JSON.stringify(rows, null, 2));
      return;
    }

    if (format === "xlsx" || format === "excel") {
      const buf = rowsToXlsxBuffer(rows, "Questions");
      res
        .setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        .setHeader("Content-Disposition", `attachment; filename="${baseName}.xlsx"`)
        .send(buf);
    } else {
      const buf = rowsToCsvBuffer(rows);
      res
        .setHeader("Content-Type", "text/csv; charset=utf-8")
        .setHeader("Content-Disposition", `attachment; filename="${baseName}.csv"`)
        .send(buf);
    }
  } catch (err: any) {
    console.error("Export error:", err);
    res.status(500).json({ error: err.message ?? "Export failed" });
  }
};