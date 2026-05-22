import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/db';
import { commentRateLimit } from '../config/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import {
  createCommentSchema,
  updateCommentSchema,
  commentParamsSchema,
  postCommentsParamsSchema
} from '../validators/commentValidator';
import { verifyAccessToken } from '../utils/jwt';

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id || (req.user as any)._id.toString();

  if (!commentRateLimit(userId)) {
    throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Too many comments');
  }

  const { postId } = postCommentsParamsSchema.parse(req.params);
  const { content, parentId } = createCommentSchema.parse(req.body);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  if (parentId) {
    const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parentComment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Parent comment not found");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: userId,
      content,
      parentId: parentId || null
    }
  });

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, comment, "Comment created successfully")
  );
});

export const getPostComments = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = postCommentsParamsSchema.parse(req.params);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || !post.published) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const bearer = req.headers.authorization;
  const tokenFromCookie = req.cookies?.access_token as string | undefined;
  const token = tokenFromCookie || (bearer && bearer.startsWith('Bearer ') ? bearer.split(" ")[1] : undefined);

  let currentUserId: string | null = null;
  if (token) {
    try {
      const payload = verifyAccessToken(token) as { sub: string };
      currentUserId = payload.sub;
    } catch (e) { }
  }

  const commentsRaw = await prisma.comment.findMany({
    where: { postId },
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'asc' }
  });

  const comments = commentsRaw.map(comment => ({ ...comment, authorId: comment.author }));

  const commentsResponse = comments.map(comment => {
    const likesCount = comment.likes?.length || 0;
    const hasLiked = currentUserId ? comment.likes?.some((id: string) => id === currentUserId) : false;

    const mappedComment: any = {
      ...comment,
      likesCount,
      hasLiked,
    };

    delete mappedComment.likes;

    return mappedComment;
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, commentsResponse, "Comments fetched successfully")
  );
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = commentParamsSchema.parse(req.params);
  const { content } = updateCommentSchema.parse(req.body);

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");

  const userId = req.user!.id || (req.user as any)._id.toString();

  if (comment.authorId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to update this comment");
  }

  const updatedComment = await prisma.comment.update({
    where: { id },
    data: { content }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, updatedComment, "Comment updated successfully")
  );
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = commentParamsSchema.parse(req.params);

  const userId = req.user!.id || (req.user as any)._id.toString();

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");

  const post = await prisma.post.findUnique({ where: { id: comment.postId } });

  if (comment.authorId !== userId && post?.authorId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to delete this comment");
  }

  await prisma.comment.delete({ where: { id } });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, "Comment deleted successfully")
  );
});

export const likeComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = commentParamsSchema.parse(req.params);

  const userId = req.user!.id || (req.user as any)._id.toString();

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");

  const hasLiked = comment.likes.some(likeId => likeId === userId);

  const updatedLikes = hasLiked
    ? comment.likes.filter((likeId) => likeId !== userId)
    : [...comment.likes, userId];

  const updatedComment = await prisma.comment.update({
    where: { id },
    data: { likes: updatedLikes }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {
      likesCount: updatedComment.likes.length,
      hasLiked: !hasLiked
    }, "Comment like toggled")
  );
});
