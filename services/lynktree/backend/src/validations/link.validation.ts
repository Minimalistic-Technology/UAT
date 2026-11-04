import { z } from 'zod';

export const createLinkSchema = z.object({
  type: z.enum(['link', 'pdf']).default('link'),
  title: z.string().trim().min(1, 'Title is required').max(100),
  url: z.string().trim().url('Enter a valid URL'),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal('')),
});
export type CreateLinkInput = z.infer<typeof createLinkSchema>;

export const updateLinkSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  url: z.string().trim().url().optional(),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

export const reorderLinksSchema = z.object({
  order: z
    .array(
      z.object({
        id: z.string().min(1),
        order: z.number().int().min(0),
      })
    )
    .min(1),
});
export type ReorderLinksInput = z.infer<typeof reorderLinksSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().trim().max(50).optional(),
  bio: z.string().trim().max(200).optional(),
  avatarUrl: z.string().trim().url().optional().or(z.literal('')),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
