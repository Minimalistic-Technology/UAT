import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { gameConfigSchema, updateGameConfigSchema } from '../validation/gameConfigValidation';
import GameConfig from '../models/gameConfig';
import { IGameConfig } from '../models/gameConfig';
import cloudinary from "../userUtils/cloudinaryClient";
import stream from "stream";


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


// --- Helper function to ensure only one config is active ---
const deactivateAllConfigs = async (excludeId: string | null = null) => {
  const filter = excludeId ? { _id: { $ne: excludeId } } : {};
  await GameConfig.updateMany(filter, { isActive: false });
};

/**
 * @desc    Create a new game config
 * @route   POST /api/v1/game-config
 */
export const createGameConfig = async (req: Request, res: Response) => {
  try {
    const validatedData = gameConfigSchema.parse(req.body);

    // LOGIC: If this new one is active, deactivate all others
    if (validatedData.isActive) {
      await deactivateAllConfigs();
    }

    const newConfig = new GameConfig(validatedData);
    await newConfig.save();
    
    res.status(201).json({
      message: 'Game configuration saved successfully!',
      config: newConfig
    });

  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid data provided', errors: error.flatten().fieldErrors });
      return;
    }
    console.error('Error saving game config:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

/**
 * @desc    Get all game configs (light version)
 * @route   GET /api/v1/game-config
 */
export const getAllGameConfigs = async (req: Request, res: Response) => {
  try {
    // Only select key info for the list view
    const configs = await GameConfig.find({})
      .select('configName isActive createdAt updatedAt')
      .sort({ createdAt: -1 });
      
    res.status(200).json(configs);
  } catch (error) {
    console.error('Error fetching game configs:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

/**
 * @desc    Get a single game config by ID
 * @route   GET /api/v1/game-config/:id
 */
export const getGameConfigById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await GameConfig.findById(id);

    if (!config) {
      res.status(404).json({ message: 'Configuration not found' });
      return;
    }

    res.status(200).json(config);
  } catch (error) {
    console.error('Error fetching game config:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

/**
 * @desc    Update a game config by ID
 * @route   PUT /api/v1/game-config/:id
 */

export const updateGameConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateGameConfigSchema.parse(req.body);

    // LOGIC: If this one is being set to active, deactivate all others
    if (validatedData.isActive) {
      await deactivateAllConfigs(id);
    }
    
    const updatedConfig = await GameConfig.findByIdAndUpdate(id, validatedData, {
      new: true
    });

    if (!updatedConfig) {
      res.status(404).json({ message: 'Configuration not found' });
      return;
    }

    res.status(200).json({
      message: 'Configuration updated successfully',
      config: updatedConfig
    });

  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid data provided', errors: error.flatten().fieldErrors });
      return;
    }
    console.error('Error updating game config:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};



/**
 * @desc    Delete a game config by ID
 * @route   DELETE /api/v1/game-config/:id
 */

/** Helper: delete a single asset from Cloudinary */

const deleteFromCloudinary = (publicId: string, type: string = "image"): Promise<any> => {
  return new Promise((resolve, reject) => {

    cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: type,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        invalidate: true,
      } as any,
      (error, result) => {
        console.log("Cloudinary destroy response (GameConfig):", {
          publicId,
          type,
          error,
          result,
        });

        if (error) {
          console.error(" Cloudinary delete FAILED:", publicId, error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

export const deleteGameConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await GameConfig.findById(id);

    if (!config) {
      res.status(404).json({ message: "Configuration not found" });
      return;
    }

    // prizeLadder is an ARRAY in your data
    const prizeLadder: any[] = (config as any).prizeLadder || [];

    const deletions: Promise<any>[] = [];

    if (Array.isArray(prizeLadder)) {
      for (const level of prizeLadder) {
        // your sample: level.media.public_id
        if (level?.media?.public_id) {
          const publicId = level.media.public_id;
          const type = level.media.type || "image";

          
          deletions.push(deleteFromCloudinary(publicId, type));
        }
      }
    }

    if (deletions.length > 0) {
      await Promise.allSettled(deletions);
    } else {
      console.log("ℹ️ No media found in prizeLadder to delete.");
    }

    await GameConfig.deleteOne({ _id: id });

    res.status(200).json({ message: "Configuration deleted successfully" });
  } catch (error) {
    console.error("Error deleting game config:", error);
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

/**
 * @desc    Upload image for a single prize ladder level and save to media
 * @route   POST /api/v1/game-config/prize-ladder-image
 * @access  Admin (or whatever you use)
 */


export const updatePrizeLadderMedia = async (req: Request, res: Response) : Promise<void> => {
  try {
    const { configId, prizeLadderId, giftDesc } = req.body;

    if (!configId || !prizeLadderId) {
       res.status(400).json({
        message: "configId and prizeLadderId are required",
      });
    }

    if (!req.file) {
       res.status(400).json({
        message: "Image file is required",
      });
    }

    const existingConfig = await GameConfig.findOne(
      { _id: configId, "prizeLadder._id": prizeLadderId },
      { "prizeLadder.$": 1 } // only bring the matched prize level
    ).lean();

    if (!existingConfig || !existingConfig.prizeLadder?.length) {
       res.status(404).json({
        message: "GameConfig or prize level not found",
      });
      return;
    }

    const oldPrizeLevel: any = existingConfig.prizeLadder[0];
    const oldMedia = oldPrizeLevel.media;
    const oldPublicId = oldMedia?.public_id;
    const oldType = oldMedia?.type || "image";

    const media = await uploadSingleToCloudinary(req.file);
    if (!media) {
       res.status(500).json({
        message: "Failed to upload image",
      });
      return
    }

    const updatedConfig = await GameConfig.findOneAndUpdate(
      {
        _id: configId,
        "prizeLadder._id": prizeLadderId,
      },
      {
        $set: {
          "prizeLadder.$.type": "gift",
          "prizeLadder.$.value": giftDesc || "",
          "prizeLadder.$.media": media,
        },
      },
      { new: true }
    );

    if (!updatedConfig) {
       res.status(404).json({
        message: "GameConfig or prize level not found after update",
      });
      return
    }

    if (oldPublicId && oldPublicId !== media.public_id) {
      try {
        await deleteFromCloudinary(oldPublicId, oldType);
      } catch (err) {
        console.error("Error deleting old media from Cloudinary:", err);
      }
    }

    const updatedPrizeLevel = updatedConfig.prizeLadder.find(
      (pl: any) => pl._id.toString() === prizeLadderId
    );

     res.status(200).json({
      message: "Gift image updated successfully",
      prizeLadderId: updatedPrizeLevel?._id,
      media: updatedPrizeLevel?.media,
      type: updatedPrizeLevel?.type,
      value: updatedPrizeLevel?.value,
    });
  } catch (error) {
    console.error("Error updating prize ladder media:", error);
     res.status(500).json({
      message: "An internal server error occurred.",
    });
  }
};

export const removePrizeLadderMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { configId, prizeLadderId } = req.body;

    if (!configId || !prizeLadderId) {
       res.status(400).json({
        message: 'configId and prizeLadderId are required',
      });
      return;
    }

    // 1) Get current prize level to read old media
    const existingConfig = await GameConfig.findOne(
      { _id: configId, 'prizeLadder._id': prizeLadderId },
      { 'prizeLadder.$': 1 } // only matched prize level
    ).lean();

    if (!existingConfig || !existingConfig.prizeLadder?.length) {
       res.status(404).json({
        message: 'GameConfig or prize level not found',
      });
      return;
    }

    const oldPrizeLevel: any = existingConfig.prizeLadder[0];
    const oldMedia = oldPrizeLevel.media;
    const oldPublicId = oldMedia?.public_id;
    const oldType = oldMedia?.type || 'image';

    // 2) Remove media from the document
    const updatedConfig = await GameConfig.findOneAndUpdate(
      {
        _id: configId,
        'prizeLadder._id': prizeLadderId,
      },
      {
        $unset: {
          'prizeLadder.$.media': '', // remove media field
        },
        // If you ALSO want to reset type/value when image is removed, you could do:
        // $set: {
        //   'prizeLadder.$.type': 'gift',
        //   'prizeLadder.$.value': ''
        // }
      },
      { new: true }
    );

    if (!updatedConfig) {
       res.status(404).json({
        message: 'GameConfig or prize level not found after update',
      });
      return;
    }

    // 3) Delete from Cloudinary if existed
    if (oldPublicId) {
      try {
        await deleteFromCloudinary(oldPublicId, oldType);
      } catch (err) {
        console.error('Error deleting old media from Cloudinary:', err);
        // not throwing so the response still succeeds
      }
    }

    const updatedPrizeLevel = updatedConfig.prizeLadder.find(
      (pl: any) => pl._id.toString() === prizeLadderId
    );

     res.status(200).json({
      message: 'Gift image removed successfully',
      prizeLadderId: updatedPrizeLevel?._id,
      media: updatedPrizeLevel?.media ?? null,
      type: updatedPrizeLevel?.type,
      value: updatedPrizeLevel?.value,
    });
  } catch (error) {
    console.error('Error removing prize ladder media:', error);
     res.status(500).json({
      message: 'An internal server error occurred.',
    });
  }
};