import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { PostStatus, NotificationType, Role } from '@prisma/client';

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

// ─── USER CONTROLLER ENDPOINTS ────────────────────────────────────────────────
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true
    }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, users, 'Users fetched successfully')
  );
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role, firstName, lastName, isVerified } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

  const updateData: Record<string, any> = {};
  if (role && (role === 'admin' || role === 'user')) {
    updateData.role = role as Role;
  }
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (isVerified !== undefined) updateData.isVerified = isVerified;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, updatedUser, 'User updated successfully')
  );
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

  // Prevent admin from deleting themselves
  if (req.user && req.user.id === userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot delete your own admin account');
  }

  await prisma.user.delete({ where: { id: userId } });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'User deleted successfully')
  );
});

// ─── ROUTE PERMISSIONS ENDPOINTS ──────────────────────────────────────────────
export const listPermissions = asyncHandler(async (req: Request, res: Response) => {
  const permissions = await prisma.routePermission.findMany({
    orderBy: [{ role: 'asc' }, { path: 'asc' }]
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, permissions, 'Permissions fetched successfully')
  );
});

export const createPermission = asyncHandler(async (req: Request, res: Response) => {
  const { path, method, role, isActive, description } = req.body;

  if (!path || !role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Path and Role parameters are required');
  }

  if (role !== 'admin' && role !== 'user') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid role');
  }

  // Check unique key constraint manually
  const existing = await prisma.routePermission.findUnique({
    where: {
      path_method_role: {
        path: path.trim(),
        method: method ? method.trim() : null,
        role: role as Role
      }
    }
  });

  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, 'Permission rule already exists');
  }

  const permission = await prisma.routePermission.create({
    data: {
      path: path.trim(),
      method: method ? method.toUpperCase().trim() : null,
      role: role as Role,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      description: description ? description.trim() : null
    }
  });

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, permission, 'Permission created successfully')
  );
});

export const togglePermission = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const permission = await prisma.routePermission.findUnique({ where: { id } });
  if (!permission) throw new ApiError(StatusCodes.NOT_FOUND, 'Permission rule not found');

  const updatedPermission = await prisma.routePermission.update({
    where: { id },
    data: { isActive: !permission.isActive }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, updatedPermission, 'Permission toggled successfully')
  );
});

export const deletePermission = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const permission = await prisma.routePermission.findUnique({ where: { id } });
  if (!permission) throw new ApiError(StatusCodes.NOT_FOUND, 'Permission rule not found');

  await prisma.routePermission.delete({ where: { id } });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'Permission rule deleted successfully')
  );
});

