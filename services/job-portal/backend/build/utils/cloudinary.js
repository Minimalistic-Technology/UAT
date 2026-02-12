import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';
cloudinary.config({
    cloud_name: config.cloudinaryName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
});
export const uploadToCloudinary = async (fileBuffer, folder, resourceType = 'auto', id, format) => {
    return new Promise((resolve, reject) => {
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
};
export const deleteFromCloudinary = async (publicId) => {
    await cloudinary.uploader.destroy(publicId);
};
