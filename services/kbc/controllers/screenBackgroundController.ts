import { Request, Response } from "express";
import cloudinary from "../userUtils/cloudinaryClient";
import ScreenBackground from "../models/ScreenBackground";
import stream from "stream";

/* ------------------------- Utils ------------------------- */

/** Cloudinary single upload from req.file -> mediaRef */
const uploadSingleToCloudinary = async (file?: Express.Multer.File) => {
    if (!file) return undefined;
    const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(uploadStream);
    });

    return {
        public_id: result.public_id,
        url: result.secure_url,
        type: result.resource_type,
        format: result.format,
    };
};

const deleteFromCloudinary = (publicId: string, type: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: type,
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            } as any,
            (error, result) => {
                console.log("Cloudinary destroy response:", {
                    publicId,
                    type,
                    error,
                    result,
                });

                if (error) reject(error);
                else resolve(result);
            }
        );
    });
};

/* ------------------------- Controllers ------------------------- */

export const createOrUpdateScreenBackground = async (req: Request, res: Response) => {
    try {
        const { screenName } = req.params;
        if (!screenName) {
            res.status(400).json({ error: "Screen name is required" });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: "Image file is required" });
            return;
        }

        let screenBg = await ScreenBackground.findOne({ screenName });

        // If exists, delete old image from Cloudinary
        if (screenBg && screenBg.mediaRef && screenBg.mediaRef.public_id) {
            try {
                await deleteFromCloudinary(screenBg.mediaRef.public_id, screenBg.mediaRef.type || "image");
            } catch (delErr) {
                console.error("Error deleting old background image:", delErr);
                // Continue even if delete fails, we want to update to new image
            }
        }

        // Upload new image
        const mediaRef = await uploadSingleToCloudinary(req.file);
        if (!mediaRef) {
            res.status(500).json({ error: "Failed to upload image" });
            return;
        }

        if (screenBg) {
            screenBg.mediaRef = mediaRef;
            await screenBg.save();
        } else {
            screenBg = await ScreenBackground.create({
                screenName,
                mediaRef,
            });
        }

        res.json({ success: true, data: screenBg });
    } catch (err: any) {
        console.error("Error in createOrUpdateScreenBackground:", err);
        res.status(500).json({ error: err.message || "Something went wrong" });
    }
};

export const getScreenBackground = async (req: Request, res: Response) => {
    try {
        const { screenName } = req.params;
        const screenBg = await ScreenBackground.findOne({ screenName });

        if (!screenBg) {
            res.status(404).json({ error: "Background not found for this screen" });
            return;
        }

        res.json({ success: true, data: screenBg });
    } catch (err: any) {
        console.error("Error in getScreenBackground:", err);
        res.status(500).json({ error: err.message || "Something went wrong" });
    }
};

export const getAllScreenBackgrounds = async (req: Request, res: Response) => {
    try {
        const screens = await ScreenBackground.find().sort({ createdAt: -1 });
        res.json({ success: true, data: screens });
    } catch (err: any) {
        console.error("Error in getAllScreenBackgrounds:", err);
        res.status(500).json({ error: err.message || "Something went wrong" });
    }
};
