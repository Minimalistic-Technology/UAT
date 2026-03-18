
import mongoose from "mongoose";
import Question from "../models/Question";
import ImportJob from "../models/ImportJob";

export async function importQuestionsFromJSON(
  rows: Array<{ lang: any; correctIndex: number; status: "draft" | "published" }>,
  jobId?: string,
  bankId?: string
) {
  const report: Array<{ row: number; success: boolean; error?: string }> = [];
  let successCount = 0;

  for (let i = 0; i < rows.length; i++) {
    try {
      if (!bankId) throw new Error("bankId required");
      const r = rows[i];

      // basic checks (schema will re-validate on save)
      if (!r.lang?.en?.text) throw new Error("lang.en.text required");
      const blocks = [r.lang.en, r.lang.hi, r.lang.gu].filter(Boolean);
      for (const b of blocks) {
        if (!Array.isArray(b.options) || b.options.length !== 4) {
          throw new Error("Each language block must have exactly 4 options");
        }
      }
      if (typeof r.correctIndex !== "number" || r.correctIndex < 0 || r.correctIndex > 3) {
        throw new Error("correctIndex invalid");
      }

      const filter = {
        bankId: new mongoose.Types.ObjectId(bankId),
        "lang.en.text": r.lang.en.text,
      };

      const update = {
        $set: {
          bankId: new mongoose.Types.ObjectId(bankId),
          lang: r.lang,
          correctIndex: r.correctIndex,
          status: r.status ?? "draft",
          createdBy: "import",
          deleted: false,
        },
      };

      await Question.findOneAndUpdate(filter, update, { upsert: true, new: true });
      successCount++;
      report.push({ row: i + 1, success: true });
    } catch (err: any) {
      report.push({ row: i + 1, success: false, error: err.message });
    }
  }

  if (jobId) {
    await ImportJob.findByIdAndUpdate(jobId, {
      status: "completed",
      successCount,
      totalRows: rows.length,
      errorRows: report.filter((r) => !r.success),
    });
  }

  return report;
}
