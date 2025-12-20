import multer from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
  req: Request,
  file,
  cb
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);

    // attach custom error message to request
    (req as any).fileValidationError =
      "Invalid file type. Only JPG, PNG, and PDF are allowed.";
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});