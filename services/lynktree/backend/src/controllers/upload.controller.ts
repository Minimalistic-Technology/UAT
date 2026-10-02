import { Request, Response } from 'express';
import { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import cloudinary from '../config/cloudinary';

function streamUpload(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

// POST /uploads — multipart/form-data, field name: "file"
export const uploadAsset = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(400, 'No file provided');

  const isPdf = req.file.mimetype === 'application/pdf';
  const result = await streamUpload(req.file.buffer, {
    folder: `lynktree/${req.user._id}`,
    resource_type: isPdf ? 'raw' : 'image',
    type: 'upload',
  });

  sendSuccess(res, 201, 'File uploaded', {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    isPdf,
  });
});
