import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { gameConfigSchema, updateGameConfigSchema } from '../validation/gameConfigValidation';
import GameConfig from '../models/gameConfig';

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
      new: true, // Return the updated document
      runValidators: true,
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
export const deleteGameConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedConfig = await GameConfig.findByIdAndDelete(id);

    if (!deletedConfig) {
      res.status(4404).json({ message: 'Configuration not found' });
      return;
    }

    res.status(200).json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting game config:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};