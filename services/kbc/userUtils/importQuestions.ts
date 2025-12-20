import Question from "../models/Question";
import { verifyMediaRefs } from "./mediaValidator";

export async function importQuestionsFromJSON(rows: any[]) {
  const report: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      if (!row.bankId || !row.text) throw new Error("bankId and text required");
      if (!Array.isArray(row.options) || row.options.length !== 4)
        throw new Error("options must be array of 4");
      if (row.correctIndex < 0 || row.correctIndex > 3)
        throw new Error("correctIndex invalid");

      const { missing } = await verifyMediaRefs(row.mediaRefs || []);
      if (missing.length > 0) throw new Error(`Missing media refs: ${missing.join(",")}`);

      const q = await Question.create({
        ...row,
        createdBy: row.createdBy || "import",
      });

      report.push({ row: i + 1, success: true, id: q._id });
    } catch (err: any) {
      report.push({ row: i + 1, success: false, error: err.message });
    }
  }

  return report;
}
