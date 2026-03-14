import cloudinary from '../config/cloudinary';

export interface CloudinaryUploadResult {
  url:       string;
  publicId:  string;
  width:     number;
  height:    number;
  format:    string;
}

// Upload a file buffer directly (used after multer memoryStorage)
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  mimetype:   string,
  folder =    'blog-covers',
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 630, crop: 'fill', gravity: 'auto' }, // OG-image dimensions
          { quality: 'auto', fetch_format: 'auto' },                    // auto WebP/AVIF
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve({
          url:      result.secure_url,
          publicId: result.public_id,
          width:    result.width,
          height:   result.height,
          format:   result.format,
        });
      },
    );
    uploadStream.end(fileBuffer);
  });
};

// Delete by public_id stored in the DB
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Cloudinary delete failed: ${result.result}`);
  }
};