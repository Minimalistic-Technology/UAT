import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import SiteSetting from '../models/SiteSetting';
import Post from '../models/Post';

// Logic below assumes requireAuth and isAdmin middlewares have already passed

// ─── GET /admin/settings ─────────────────────────────────────────────────────
export const getSettings = asyncHandler(async (req: Request, res: Response) => {

  // Find or create the singleton settings document
  let setting = await SiteSetting.findOne({ key: 'global' });
  if (!setting) {
    setting = await SiteSetting.create({ key: 'global', autoApprovePost: true });
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { autoApprovePost: setting.autoApprovePost }, 'Settings fetched')
  );
});

// ─── PATCH /admin/settings ───────────────────────────────────────────────────
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {

  const { autoApprovePost } = req.body;
  if (typeof autoApprovePost !== 'boolean') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'autoApprovePost must be a boolean');
  }

  const setting = await SiteSetting.findOneAndUpdate(
    { key: 'global' },
    { autoApprovePost },
    { upsert: true, returnDocument: 'after' }
  );

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { autoApprovePost: setting!.autoApprovePost }, 'Settings updated')
  );
});

// ─── GET /admin/posts/pending ────────────────────────────────────────────────
export const getPendingPosts = asyncHandler(async (req: Request, res: Response) => {

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Post.find({ status: 'pending' })
      .populate('authorId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments({ status: 'pending' }),
  ]);

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {
      items,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    }, 'Pending posts fetched')
  );
});

// ─── GET /admin/posts/all ────────────────────────────────────────────────────
export const getAllPostsAdmin = asyncHandler(async (req: Request, res: Response) => {

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const skip = (page - 1) * limit;
  const { status } = req.query;

  const filter: Record<string, any> = {};
  if (status && ['pending', 'published', 'rejected'].includes(String(status))) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    Post.find(filter)
      .populate('authorId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {
      items,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    }, 'All posts fetched')
  );
});

// ─── PATCH /admin/posts/:postId/approve ──────────────────────────────────────
export const approvePost = asyncHandler(async (req: Request, res: Response) => {

  const { postId } = req.params;
  const post = await Post.findByIdAndUpdate(
    postId,
    { status: 'published', published: true },
    { returnDocument: 'after' }
  );

  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { _id: post._id, status: post.status }, 'Post approved and published')
  );
});

// ─── PATCH /admin/posts/:postId/reject ───────────────────────────────────────
export const rejectPost = asyncHandler(async (req: Request, res: Response) => {

  const { postId } = req.params;
  const post = await Post.findByIdAndUpdate(
    postId,
    { status: 'rejected', published: false },
    { returnDocument: 'after' }
  );

  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { _id: post._id, status: post.status }, 'Post rejected')
  );
});
