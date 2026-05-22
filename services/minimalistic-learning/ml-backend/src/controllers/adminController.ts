import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { PostStatus, NotificationType } from '@prisma/client';

// ─── DELETE /admin/posts/:postId ──────────────────────────────────────────────
export const deletePostAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { reason } = req.body;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');

  const authorId = post.authorId;
  const postTitle = post.title;

  await prisma.post.delete({ where: { id: postId } });

  await prisma.notification.create({
    data: {
      recipientId: authorId,
      title: 'Post Deleted by Admin',
      message: `Your post "${postTitle}" was deleted by an admin.${reason ? ` Reason: ${reason}` : ''}`,
      type: NotificationType.post_deleted
    }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'Post deleted and user notified')
  );
});

// ─── GET /admin/settings ─────────────────────────────────────────────────────
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  let setting = await prisma.siteSetting.findUnique({ where: { key: 'global' } });
  if (!setting) {
    setting = await prisma.siteSetting.create({
      data: { key: 'global', autoApprovePost: true, resourceHubEnabled: true }
    });
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

  const setting = await prisma.siteSetting.upsert({
    where: { key: 'global' },
    update: updateData,
    create: {
      key: 'global',
      autoApprovePost: typeof autoApprovePost === 'boolean' ? autoApprovePost : true,
      resourceHubEnabled: typeof resourceHubEnabled === 'boolean' ? resourceHubEnabled : true
    }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {
      autoApprovePost: setting.autoApprovePost,
      resourceHubEnabled: setting.resourceHubEnabled ?? true,
    }, 'Settings updated')
  );
});

// ─── GET /admin/posts/pending ────────────────────────────────────────────────
export const getPendingPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const skip = (page - 1) * limit;

  const [itemsRaw, total] = await Promise.all([
    prisma.post.findMany({
      where: { status: PostStatus.pending },
      include: { author: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.post.count({ where: { status: PostStatus.pending } })
  ]);

  const items = itemsRaw.map(item => ({ ...item, authorId: item.author }));

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

  const filter: any = {};
  if (status && ['pending', 'published', 'rejected'].includes(String(status))) {
    filter.status = status as PostStatus;
  }

  const [itemsRaw, total] = await Promise.all([
    prisma.post.findMany({
      where: filter,
      include: { author: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.post.count({ where: filter })
  ]);

  const items = itemsRaw.map(item => ({ ...item, authorId: item.author }));

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

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: { status: PostStatus.published, published: true }
  });

  await prisma.notification.create({
    data: {
      recipientId: updatedPost.authorId,
      title: 'Post Approved! 🎉',
      message: `Great news! Your post "${updatedPost.title}" has been approved and is now live on the platform.`,
      type: NotificationType.post_approved
    }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { _id: updatedPost.id, id: updatedPost.id, status: updatedPost.status }, 'Post approved and published')
  );
});

// ─── PATCH /admin/posts/:postId/reject ───────────────────────────────────────
export const rejectPost = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: { status: PostStatus.rejected, published: false }
  });

  await prisma.notification.create({
    data: {
      recipientId: updatedPost.authorId,
      title: 'Post Rejected',
      message: `Your post "${updatedPost.title}" was not approved by the admin. Please review our guidelines and try again.`,
      type: NotificationType.post_rejected
    }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { _id: updatedPost.id, id: updatedPost.id, status: updatedPost.status }, 'Post rejected')
  );
});

