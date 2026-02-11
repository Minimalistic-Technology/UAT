import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { commentRateLimit } from '../config/rateLimit';

export const addComment = async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();

  if (!commentRateLimit(userId)) {
    return res.status(429).json({ message: 'Too many comments' });
  }

  const comment = await Comment.create({
    postId: req.params.id,
    authorId: userId,
    content: req.body.content
  });

  res.status(201).json(comment);
};

export const deleteComment = async (req: Request, res: Response) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.sendStatus(404);

  const post = await Post.findById(comment.postId);

  if (
    comment.authorId.toString() !== req.user!._id.toString() &&
    post?.authorId.toString() !== req.user!._id.toString()
  ) {
    return res.sendStatus(403);
  }

  await comment.deleteOne();
  res.sendStatus(204);
};
