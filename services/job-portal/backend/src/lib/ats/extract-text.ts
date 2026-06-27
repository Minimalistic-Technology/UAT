import { PDFParse } from "pdf-parse";

export async function extractText(
  buffer: Buffer,
  mimetype: string,
): Promise<string> {
  if (mimetype === "application/pdf") {
    const parser = new PDFParse({data: buffer})
    const result = await parser.getText();
    return result.text;
  }
  // This will be usefull if we accept docs, but we're only allowing pdf's currently
  //   if (
  //     mimetype ===
  //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  //   ) {
  //     const result = await mammoth.extractRawText({ buffer });
  //     return result.value;
  //   }

  throw new Error("Upload a PDF file.");
}
