import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import Link from '../models/Link.model';
import cloudinary from '../config/cloudinary';

// GET /links
export const getMyLinks = asyncHandler(async (req: Request, res: Response) => {
  const links = await Link.find({ user: req.user._id }).sort({ order: 1, createdAt: 1 });
  sendSuccess(res, 200, 'OK', { links });
});

// POST /links
export const createLink = asyncHandler(async (req: Request, res: Response) => {
  const { type, title, url, thumbnailUrl } = req.body;
  const count = await Link.countDocuments({ user: req.user._id });

  const link = await Link.create({
    user: req.user._id,
    type,
    title,
    url,
    thumbnailUrl: thumbnailUrl || '',
    order: count,
  });

  sendSuccess(res, 201, 'Link added', { link });
});

// PATCH /links/:id
export const updateLink = asyncHandler(async (req: Request, res: Response) => {
  const link = await Link.findOne({ _id: req.params.id, user: req.user._id });
  if (!link) throw new ApiError(404, 'Link not found');

  Object.assign(link, req.body);
  await link.save();

  sendSuccess(res, 200, 'Link updated', { link });
});

// DELETE /links/:id
export const deleteLink = asyncHandler(async (req: Request, res: Response) => {
  const link = await Link.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!link) throw new ApiError(404, 'Link not found');

  if (link.cloudinaryPublicId) {
    const resourceType = link.type === 'pdf' ? 'raw' : 'image';
    await cloudinary.uploader
      .destroy(link.cloudinaryPublicId, { resource_type: resourceType })
      .catch(() => {});
  }

  sendSuccess(res, 200, 'Link deleted');
});

// PUT /links/reorder
export const reorderLinks = asyncHandler(async (req: Request, res: Response) => {
  const { order } = req.body as { order: { id: string; order: number }[] };

  const ops = order.map(({ id, order: pos }) => ({
    updateOne: {
      filter: { _id: id, user: req.user._id },
      update: { $set: { order: pos } },
    },
  }));

  if (ops.length) await Link.bulkWrite(ops);

  const links = await Link.find({ user: req.user._id }).sort({ order: 1, createdAt: 1 });
  sendSuccess(res, 200, 'Order updated', { links });
});
