// File: types/gameConfig.validation.ts

import { z } from 'zod';

// Schema for the 'media' object (used for gifts)
const mediaAssetSchema = z.object({
  url: z.string().url(),
  fileName: z.string().min(1),
}).optional();

// Schema for a single 'PrizeLevel'
const prizeLevelSchema = z.object({
  level: z.number().int().min(1),
  type: z.enum(['money', 'gift']),
  value: z.union([
    z.number().min(0), 
    z.string().min(1, 'Gift description cannot be empty')
  ]),
  isSafe: z.boolean(),
  media: mediaAssetSchema,
}).refine(data => {
  if (data.type === 'money' && typeof data.value !== 'number') return false;
  if (data.type === 'gift' && typeof data.value !== 'string') return false;
  return true;
}, {
  message: "Value type must match prize type (number for 'money', string for 'gift')",
});

// Schema for the 'Lifeline' object
const lifelineSchema = z.object({
  '50:50': z.boolean(),
  'Audience Poll': z.boolean(),
  'Expert Advice': z.boolean(),
  'Flip Question': z.boolean(),
});

// The main schema for CREATING a config
export const gameConfigSchema = z.object({
  configName: z.string().min(3, 'Config name must be at least 3 characters'), // <-- NEW
  isActive: z.boolean().optional(), // <-- NEW
  selectedBanks: z.array(z.string()).min(1, 'At least one bank must be selected'),
  prizeLadder: z.array(prizeLevelSchema).min(1, 'Prize ladder cannot be empty'),
  lifelines: lifelineSchema,
});

// Schema for UPDATING a config (all fields are optional)
export const updateGameConfigSchema = gameConfigSchema.partial(); // <-- NEW