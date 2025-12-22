import { Request, Response } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';

export const listPosts = async (req: Request, res: Response): Promise<Response> => {
  const { tag, q } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 10);

  const query: Record<string, unknown> = { published: true };

  if (tag) query.tags = tag;
  if (q) query.$text = { $search: String(q) };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Post.find(query)
      .select('title slug tags createdAt authorId')
      .populate('authorId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(query)
  ]);

  return res.json({ items, total });
};

export const getPostBySlug = async (req: Request, res: Response): Promise<Response> => {
  const post = await Post.findOne({
    slug: req.params.slug,
    published: true
  })
    .populate('authorId', 'name')
    .select('-__v');

  if (!post) {
    return res.sendStatus(404);
  }

  return res.json(post);
};

export const listComments = async (req: Request, res: Response): Promise<Response> => {
  const post = await Post.findOne({
    _id: req.params.id,
    published: true
  });

  if (!post) {
    return res.sendStatus(404);
  }

  const comments = await Comment.find({ postId: req.params.id })
    .populate('authorId', 'name')
    .select('content createdAt authorId')
    .sort({ createdAt: 1 });

  return res.json(comments);
};

export const createPost = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { title, content, tags, published } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content required' });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const post = await Post.create({
    title,
    slug,
    content,
    tags,
    published: published ?? false,
    authorId: req.user._id.toString()
  });

  return res.status(201).json(post);
};

export const updatePost = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { title, content, tags, published } = req.body;

  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, authorId: req.user._id.toString() },
    { title, content, tags, published },
    { new: true }
  );

  if (!post) {
    return res.sendStatus(404);
  }

  return res.json(post);
};

export const deletePost = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const post = await Post.findOneAndDelete({
    _id: req.params.id,
    authorId: req.user._id.toString()
  });

  if (!post) {
    return res.sendStatus(404);
  }

  return res.sendStatus(204);
};
