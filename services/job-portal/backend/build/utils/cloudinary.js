import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';
cloudinary.config({
    cloud_name: config.cloudinaryName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
});
export const uploadToCloudinary = async (fileBuffer, folder, resourceType = 'auto', id, format) => {
    const response = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder,
            resource_type: resourceType,
            public_id: id,
            format: format,
            type: 'upload', // Ensure public access (not authenticated/private)
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        });
        uploadStream.end(fileBuffer);
    });
    return response;
};
export const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            console.warn("Cloudinary delete skipped: publicId is missing");
            return false;
        }
        // resource_type is required if deleting pdf or other non-image files
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok" && result.result !== "not found") {
            console.warn("Cloudinary deletion unexpected response:", result);
            return false;
        }
        console.log("Old file deleted successfully:", publicId);
        return true;
    }
    catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        return false;
    }
};
