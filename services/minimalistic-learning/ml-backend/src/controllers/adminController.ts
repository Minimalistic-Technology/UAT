import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import SiteSetting from '../models/SiteSetting';
import Post from '../models/Post';
import Notification from '../models/Notification';

// ... (keep previous functions)

// ─── DELETE /admin/posts/:postId ──────────────────────────────────────────────
export const deletePostAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { reason } = req.body; // Optional reason for deletion

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');

  const authorId = post.authorId;
  const postTitle = post.title;

  await post.deleteOne();

  // Create notification for the author
  await Notification.create({
    recipientId: authorId,
    title: 'Post Deleted by Admin',
    message: `Your post "${postTitle}" was deleted by an admin.${reason ? ` Reason: ${reason}` : ''}`,
    type: 'post_deleted'
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'Post deleted and user notified')
  );
});

// Logic below assumes requireAuth and isAdmin middlewares have already passed

// ─── GET /admin/settings ─────────────────────────────────────────────────────
export const getSettings = asyncHandler(async (req: Request, res: Response) => {

  // Find or create the singleton settings document
  let setting = await SiteSetting.findOne({ key: 'global' });
  if (!setting) {
    setting = await SiteSetting.create({ key: 'global', autoApprovePost: true, resourceHubEnabled: true });
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {
      autoApprovePost: setting.autoApprovePost,
      resourceHubEnabled: setting.resourceHubEnabled ?? true,
    }, 'Settings fetched')
  );
});

// ─── PATCH /admin/settings ───────────────────────────────────────────────────
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {

  const { autoApprovePost, resourceHubEnabled } = req.body;

  const updateData: Record<string, any> = {};
  if (typeof autoApprovePost === 'boolean') updateData.autoApprovePost = autoApprovePost;
  if (typeof resourceHubEnabled === 'boolean') updateData.resourceHubEnabled = resourceHubEnabled;

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No valid settings provided');
  }

  const setting = await SiteSetting.findOneAndUpdate(
    { key: 'global' },
    updateData,
    { upsert: true, returnDocument: 'after' }
  );

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {
      autoApprovePost: setting!.autoApprovePost,
      resourceHubEnabled: setting!.resourceHubEnabled ?? true,
    }, 'Settings updated')
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

  // Notify author about approval
  await Notification.create({
    recipientId: post.authorId,
    title: 'Post Approved! 🎉',
    message: `Great news! Your post "${post.title}" has been approved and is now live on the platform.`,
    type: 'post_approved'
  });

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

  // Notify author about rejection
  await Notification.create({
    recipientId: post.authorId,
    title: 'Post Rejected',
    message: `Your post "${post.title}" was not approved by the admin. Please review our guidelines and try again.`,
    type: 'post_rejected'
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { _id: post._id, status: post.status }, 'Post rejected')
  );
});
