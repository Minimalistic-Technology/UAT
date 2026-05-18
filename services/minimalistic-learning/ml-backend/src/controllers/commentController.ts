import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Comment from '../models/Comment';
import Post from '../models/Post';
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
  const userId = req.user!._id.toString();

  if (!commentRateLimit(userId)) {
    throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Too many comments');
  }

  const { postId } = postCommentsParamsSchema.parse(req.params);
  const { content, parentId } = createCommentSchema.parse(req.body);

  if(!mongoose.Types.ObjectId.isValid(postId)){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid post ID");
  }

  if(parentId && !mongoose.Types.ObjectId.isValid(parentId)){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid parent comment ID");
  }

  const post = await Post.findById(postId);
  if (!post) {  
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  if (parentId) {
    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Parent comment not found");
    }
  }

  const comment = await Comment.create({
    postId,
    authorId: userId,
    content,
    parentId: parentId || null
  });

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, comment, "Comment created successfully")
  );
});

export const getPostComments = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = postCommentsParamsSchema.parse(req.params);

  if(!mongoose.Types.ObjectId.isValid(postId)){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid post ID");
  }

  const post = await Post.findById(postId);
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
    } catch (e) {
      // Ignored for public route
    }
  }

  const comments = await Comment.find({ postId: postId })
    .populate("authorId", "firstName lastName")
    .select("content createdAt updatedAt authorId likes parentId")
    .sort({ createdAt: 1 })
    .lean();

  const commentsResponse = comments.map(comment => {
    const likesCount = comment.likes?.length || 0;
    const hasLiked = currentUserId ? comment.likes?.some((id: any) => id.toString() === currentUserId) : false;

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

  if(!mongoose.Types.ObjectId.isValid(id)){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid comment ID");
  }

  const comment = await Comment.findById(id);
  if (!comment) throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");

  if (comment.authorId.toString() !== req.user!._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to update this comment");
  }

  comment.content = content;
  await comment.save();

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, comment, "Comment updated successfully")
  );
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = commentParamsSchema.parse(req.params);

  if(!mongoose.Types.ObjectId.isValid(id)){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid comment ID");
  }

  const userId =  req.user!._id.toString();

  const comment = await Comment.findById(id);
  if (!comment) throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");

  const post = await Post.findById(comment.postId);

  if (
    comment.authorId.toString() !== userId &&
    post?.authorId.toString() !== userId
  ) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to delete this comment");
  }

  await comment.deleteOne();

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, "Comment deleted successfully")
  );
});

export const likeComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = commentParamsSchema.parse(req.params);

  if(!mongoose.Types.ObjectId.isValid(id)){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid comment ID");
  }

  const userId = req.user!._id.toString();

  const comment = await Comment.findById(id);
  if (!comment) throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");

  const hasLiked = comment.likes.some(likeId => likeId.toString() === userId);

  if (hasLiked) {
    comment.likes = comment.likes.filter((likeId) => likeId.toString() !== userId);
  } else {
    comment.likes.push(new mongoose.Types.ObjectId(userId));
  }

  await comment.save();

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { 
      likesCount: comment.likes.length, 
      hasLiked: !hasLiked 
    }, "Comment like toggled")
  );
});
