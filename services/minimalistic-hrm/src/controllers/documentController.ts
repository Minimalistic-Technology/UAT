import { v2 as cloudinary } from "cloudinary";
import stream from "stream";
import { Response, Request } from "express";
import { AuthRequest } from "../utils/types";
import { EmployeeDocsModel } from "../models/document";

// helper function to upload file to cloudinary
const uploadToCloudinary = async (file: Express.Multer.File) => {
  return new Promise<any>((resolve, reject) => {
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
    bufferStream.end(file.buffer);
    bufferStream.pipe(uploadStream);
  });
};

//upload employee document
export const uploadDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if ((req as any).fileValidationError) {
      res.status(400).json({
        message: (req as any).fileValidationError,
      });
      return;
    }

    if (!(req as any).file) {
      res.status(400).json({ message: "File is required" });
      return;
    }

    const { docType } = req.body;
    if (!docType) {
      res.status(400).json({ message: "docType is required" });
      return;
    }

    const result = await uploadToCloudinary((req as any).file);

    const mediaRef = {
      public_id: result.public_id,
      url: result.secure_url,
      type: result.resource_type,
      format: result.format,
    };

    let empDocs = await EmployeeDocsModel.findOne({
      employeeId: authReq.user!.id,
      companyID: authReq.user!.companyID,
    });

    if (!empDocs) {
      empDocs = await EmployeeDocsModel.create({
        employeeId: authReq.user!.id,
        companyID: authReq.user!.companyID,
        documents: [],
      });
    }

    empDocs.documents.push({
      docType,
      document: mediaRef,
      verified: false,
      uploadedAt: new Date(),
    });

    await empDocs.save();

    res.status(201).json({ message: "Document uploaded", empDocs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

//verify employee document
export const verifyDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { employeeId, docId } = req.params;

    if (!["admin", "hr"].includes(authReq.user!.role)) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const empDocs = await EmployeeDocsModel.findOne({
      employeeId,
      companyID: authReq.user!.companyID,
    });

    if (!empDocs) {
      res.status(404).json({ message: "Documents not found" });
      return;
    }

    const doc = empDocs.documents.find((d: any) => d._id.toString() === docId);
    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    doc.verified = true;
    await empDocs.save();

    res.status(200).json({ message: "Document verified" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
};

//delete employee document
export const deleteDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { employeeId, docId } = req.params;

    const empDocs = await EmployeeDocsModel.findOne({
      employeeId,
      companyID: authReq.user!.companyID,
    });

    if (!empDocs) {
      res.status(404).json({ message: "Documents not found" });
      return;
    }

    const doc = empDocs.documents.find((d: any) => d._id.toString() === docId);
    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // 🔐 Permission check
    if (doc.verified) {
      if (!["admin", "hr"].includes(authReq.user!.role)) {
        res
          .status(403)
          .json({ message: "Only admin/hr can delete verified docs" });
        return;
      }
    } else {
      if (authReq.user!.role !== "user" || employeeId !== authReq.user!.id) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }
    }

    // Delete from cloudinary
    await cloudinary.uploader.destroy(doc.document.public_id);

    empDocs.documents = empDocs.documents.filter(
      (d: any) => d._id.toString() !== docId
    );

    await empDocs.save();
    await empDocs.save();

    res.status(200).json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

//reupload employee document
export const reuploadDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { docId } = req.params;

    if ((req as any).fileValidationError) {
      res.status(400).json({
        message: (req as any).fileValidationError,
      });
      return;
    }

    if (!(req as any).file) {
      res.status(400).json({ message: "File is required" });
      return;
    }

    const authReq = req as AuthRequest;
    const empDocs = await EmployeeDocsModel.findOne({
      employeeId: authReq.user!.id,
      companyID: authReq.user!.companyID,
    });

    if (!empDocs) {
      res.status(404).json({ message: "Documents not found" });
      return;
    }

    const doc = empDocs.documents.find((d: any) => d._id.toString() === docId);
    if (!doc || doc.verified) {
      res.status(403).json({ message: "Cannot reupload verified document" });
      return;
    }

    await cloudinary.uploader.destroy(doc.document.public_id);

    const result = await uploadToCloudinary((req as any).file);

    doc.document = {
      public_id: result.public_id,
      url: result.secure_url,
      type: result.resource_type,
      format: result.format,
    };
    doc.uploadedAt = new Date();

    await empDocs.save();

    res.status(200).json({ message: "Document reuploaded" });
  } catch (error) {
    res.status(500).json({ message: "Reupload failed" });
  }
};

//get all documents of an employee
export const getEmployeeDocuments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { employeeId } = req.params;
    const { role, companyID, id } = authReq.user!;

    // 🔐 Permission checks
    if (role === "user" && employeeId !== id) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    if (["admin", "hr"].includes(role)) {
      // same company restriction
      // enforced by query below
    }

    const docs = await EmployeeDocsModel.findOne({
      employeeId,
      companyID,
    }).lean();

    if (!docs) {
      res.status(404).json({ message: "No documents found" });
      return;
    }

    res.status(200).json(docs.documents);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};
