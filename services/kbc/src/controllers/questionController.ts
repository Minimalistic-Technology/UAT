import { Request, Response } from "express";
import cloudinary from "../userUtils/cloudinaryClient";
import Question from "../models/Question";
import { importQuestionsFromJSON } from "../userUtils/importQuestions";
import stream from "stream";
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // Parse stringified arrays
    if (typeof data.options === "string") data.options = JSON.parse(data.options);
    if (typeof data.categories === "string") data.categories = JSON.parse(data.categories);

    // Handle media upload (single file)
    if (req.file) {
      const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file?.buffer);
        bufferStream.pipe(uploadStream);
      });

      // Assign mediaRef object
      data.mediaRef = {
        public_id: result.public_id,
        url: result.secure_url,
        type: result.resource_type,
        format: result.format,
      };
    }

    // Save question to DB
    const question = await Question.create({
      ...data,
      createdBy: (req as any).admin?._id || "admin",
    });

    res.status(201).json({ success: true, question });
  } catch (err: any) {
    console.error("Error in createQuestion:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};


export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  const { bankId, status, q } = req.query;
  const filter: any = { deleted: false };
  if (bankId) filter.bankId = bankId;
  if (status) filter.status = status;
  if (q) filter.text = { $regex: q, $options: "i" };

  const questions = await Question.find(filter).sort({ createdAt: -1 });
  res.json(questions);
};

// export const createQuestion = async (req: Request, res: Response): Promise<void> => {
//   const data = req.body;
//   const { missing } = await verifyMediaRefs(data.mediaRefs || []);
//   if (missing.length > 0) res.status(400).json({ error: `Missing media refs: ${missing.join(", ")}` });

//   const question = await Question.create({
//     ...data, 
//     createdBy: (req as any).admin?._id || "admin",
//   });
//   res.status(201).json(question);
// };



export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
  const question = await Question.findById(req.params.id);
  if (!question || question.deleted) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  res.json(question);
};



export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Question.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    // Push old version to versions array
    existing.versions.push({
      snapshot: existing.toObject(),
      editedBy: (req as any).admin?._id || "admin",
      editedAt: new Date(),
    });

    // Parse stringified arrays if needed
    const data = req.body;
    if (typeof data.categories === "string") data.categories = JSON.parse(data.categories);
    if (typeof data.options === "string") data.options = JSON.parse(data.options);
    if (typeof data.correctIndex === "string") data.correctIndex = parseInt(data.correctIndex, 10);

    // Handle media upload if a new file is sent
    if (req.file) {
      const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
         {
            resource_type: "auto",
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file?.buffer);
        bufferStream.pipe(uploadStream);
      });

      // Save single mediaRef
       data.mediaRef = {
        public_id: result.public_id,
        url: result.secure_url,
        type: result.resource_type,
        format: result.format,
      };
    }

    // Merge updates
    Object.assign(existing, data);

    await existing.save();
    res.json({ success: true, question: existing });
  } catch (err: any) {
    console.error("Error in updateQuestion:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};

export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  const q = await Question.findById(req.params.id);
  if (!q) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  q.deleted = true;
  await q.save();
  res.json({ message: "Question soft-deleted" });
};

export const bulkImportQuestions = async (req: Request, res: Response): Promise<void> => {
  const rows = req.body;
  const report = await importQuestionsFromJSON(rows);
  res.json(report);
};

export const previewQuestion = async (req: Request, res: Response): Promise<void> => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const payload = {
    text: question.text,
    options: question.options.map((o) => o.text),
    media: question.mediaRef,
  };
  res.json(payload);
};
