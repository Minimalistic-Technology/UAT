import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/env.js";

cloudinary.config({
  cloud_name: config.cloudinaryName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string,
  resourceType: "auto" | "raw" | "image" | "video" = "auto",
  id?: string,
  format?: string,
): Promise<any> => {
  const response = new Promise((resolve, reject) => {

    const options: any = {
      folder,
      resource_type: resourceType,
      public_id: id,
      type: "upload", // Ensure public access (not authenticated/private)
    };

    if (resourceType !== 'raw' && format) {
      options.format = format;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    uploadStream.end(fileBuffer);
  });

  return response;
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "raw" | "video" = "image" 
): Promise<boolean> => {
  try {
    if (!publicId) {
      console.warn("Cloudinary delete skipped: publicId is missing");
      return false;
    }
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      console.warn("Cloudinary deletion unexpected response:", result);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return false;
  }
};