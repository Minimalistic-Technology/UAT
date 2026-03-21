import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import { uploadToCloudinary } from "../utils/cloudinary";
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { postParamsSchema } from '../validators/postValidator';

export const listPosts = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { tag, q } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 10);

  const query: Record<string, unknown> = { published: true };

  if (tag) query.tags = tag;
  if (q) query.$text = { $search: String(q) };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Post.find(query)
      .populate("authorId", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(query),
  ]);

  return res.json({ items, total });
};

export const getPostBySlug = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: "Slug parameter is required." 
      });
    }

    const post = await Post.findOne({
      slug: slug,
      published: true,
    })
      .populate("authorId", "firstName lastName")
      .select("-__v")
      .lean(); 

    if (!post) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: `Post with slug '${slug}' not found.` 
      });
    }

    return res.status(StatusCodes.OK).json(post);

  } catch (error) {
    console.error(`Error fetching post by slug: ${req.params.slug}`, error);
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "An unexpected error occurred while retrieving the post." 
    });
  }
};

export const getPostById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { blogId } = req.params;

    if (!blogId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: "Blog ID is required." 
      });
    }

    const post = await Post.findById(blogId)
      .populate("authorId", "firstName lastName")
      .select("-__v")
      .lean(); 

      console.log("post: ",post)

    if (!post) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: `Post with id '${blogId}' not found.` 
      });
    }

    return res.status(StatusCodes.OK).json(post);

  } catch (error) {
    console.error(`Error fetching post by slug: ${req.params.slug}`, error);
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "An unexpected error occurred while retrieving the post." 
    });
  }
};



export const createPost = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { title, content, tags, published, category } = req.body;

  if (!title?.trim())
    return res.status(400).json({ message: "Title is required" });
  if (!content?.trim())
    return res.status(400).json({ message: "Content is required" });
  if (!category?.trim())
    return res.status(400).json({ message: "Category is required" });

  // Slug
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  let slug = baseSlug;
  if (await Post.findOne({ slug })) slug = `${baseSlug}-${Date.now()}`;

  // Tags
  const sanitizedTags: string[] = Array.isArray(tags)
    ? [...new Set(tags.map((t: string) => t.trim()).filter(Boolean))]
    : [];

  // Cover image — upload if a file was attached
  let coverImage = { url: "", alt: title.trim(), publicId: "" };
  if (req.file) {
    const uploaded = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
    );
    coverImage = {
      url: uploaded.url,
      alt: title.trim(),
      publicId: uploaded.publicId,
    };
  }

  const post = await Post.create({
    title: title.trim(),
    slug,
    content: content.trim(),
    category: category.trim(),
    coverImage,
    tags: sanitizedTags,
    published: published ?? false,
    authorId: req.user._id.toString(),
  });

  return res.status(201).json(post);
};

export const updatePost = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { blogId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  const { title, content, tags, published, category } = req.body;

  const post = await Post.findOneAndUpdate(
    { _id: blogId, authorId: req.user._id.toString() },
    { title, content, tags, published, category },
    { new: true },
  );

  if (!post) return res.sendStatus(404);

  return res.json(post);
};

export const deletePost = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { blogId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  const post = await Post.findOneAndDelete({
    _id: blogId,
    authorId: req.user._id.toString(),
  });

  if (!post) return res.sendStatus(404);

  return res.sendStatus(204);
};

export const upvotePost = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = postParamsSchema.parse(req.params);
  const userId = req.user!._id;

  if(!mongoose.Types.ObjectId.isValid(blogId)){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid post ID");
  }

  const post = await Post.findById(blogId);
  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");

  const hasUpvoted = post.upvotes.includes(userId);
  const hasDownvoted = post.downvotes.includes(userId);

  if (hasUpvoted) {
    post.upvotes = post.upvotes.filter((id) => id.toString() !== userId.toString());
  } else {
    post.upvotes.push(userId);
    if (hasDownvoted) {
      post.downvotes = post.downvotes.filter((id) => id.toString() !== userId.toString());
    }
  }

  await post.save();
  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, {
    upvotes: post.upvotes.length,
    downvotes: post.downvotes.length,
    hasUpvoted: !hasUpvoted,
    hasDownvoted: hasDownvoted && !hasUpvoted ? false : hasDownvoted
  }, "Post upvoted toggled effectively"));
});

export const downvotePost = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = postParamsSchema.parse(req.params);
  const userId = req.user!._id;

  if(!mongoose.Types.ObjectId.isValid(blogId)){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid post ID");
  }

  const post = await Post.findById(blogId);
  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");

  const hasUpvoted = post.upvotes.includes(userId);
  const hasDownvoted = post.downvotes.includes(userId);

  if (hasDownvoted) {
    post.downvotes = post.downvotes.filter((id) => id.toString() !== userId.toString());
  } else {
    post.downvotes.push(userId);
    if (hasUpvoted) {
      post.upvotes = post.upvotes.filter((id) => id.toString() !== userId.toString());
    }
  }

  await post.save();
  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, {
    upvotes: post.upvotes.length,
    downvotes: post.downvotes.length,
    hasUpvoted: hasUpvoted && !hasDownvoted ? false : hasUpvoted,
    hasDownvoted: !hasDownvoted
  }, "Post downvote toggled effectively"));
});
