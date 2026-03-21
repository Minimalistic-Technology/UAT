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

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();

  if (!commentRateLimit(userId)) {
    throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Too many comments');
  }

  const { postId } = postCommentsParamsSchema.parse(req.params);
  const { content } = createCommentSchema.parse(req.body);

  if(!mongoose.Types.ObjectId.isValid(postId)){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid post ID");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const comment = await Comment.create({
    postId,
    authorId: userId,
    content
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

  const comments = await Comment.find({ postId: postId })
    .populate("authorId", "firstName lastName")
    .select("content createdAt updatedAt authorId likes")
    .sort({ createdAt: 1 });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, comments, "Comments fetched successfully")
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
