import { Request, Response } from "express";
import Post from "../models/Post";
import SiteSetting from "../models/SiteSetting";
import User from "../models/User";
import Notification from "../models/Notification";
import { uploadToCloudinary } from "../utils/cloudinary";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import {
  postParamsSchema,
  createPostSchema,
  updatePostSchema
} from "../validators/postValidator";
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

export const listPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const { tag, q, category } = req.query;

  const query: Record<string, unknown> = { published: true, status: 'published' };

  if (tag) query.tags = tag;
  if (category) query.category = category;
  if (q) query.$text = { $search: String(q) };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Post.find(query)
      .populate("authorId", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(query),
  ]);

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

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const itemsResponse = items.map((post: any) => {
    const likesCount = post.likes?.length || 0;
    const hasLiked = currentUserId ? post.likes?.some((id: any) => id.toString() === currentUserId) : false;

    const mappedPost = {
      ...post,
      likesCount,
      hasLiked,
    };
    delete mappedPost.likes;
    return mappedPost;
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        items: itemsResponse,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
      "Posts fetched successfully",
    ),
  );
});

export const listMyPosts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const query = { authorId: userId };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  const itemsResponse = items.map((post: any) => {
    const likesCount = post.likes?.length || 0;
    const hasLiked = post.likes?.some((id: any) => id.toString() === userId.toString()) || false;

    const mappedPost = {
      ...post,
      likesCount,
      hasLiked,
    };
    delete mappedPost.likes;
    return mappedPost;
  });

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        items: itemsResponse,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage,
          hasPrevPage
        },
      },
      "My posts fetched successfully",
    ),
  );
});

export const getPostBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    if (!slug) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Slug parameter is required.",
      );
    }

    const post = await Post.findOne({
      slug: slug,
      published: true,
      status: 'published',
    })
      .populate("authorId", "firstName lastName")
      .select("-__v")
      .lean();

    if (!post) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Post with slug '${slug}' not found.`,
      );
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

    const likesCount = post.likes?.length || 0;

    let hasLiked = false;

    if (currentUserId) {
      hasLiked = post.likes?.some((id: any) => id.toString() === currentUserId) || false;
    }

    const postResponse: any = {
      ...post,
      likesCount,
      hasLiked,
    };

    delete postResponse.likes;

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, postResponse, "Post fetched successfully"));
  },
);

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = postParamsSchema.parse(req.params);

  const post = await Post.findById(blogId)
    .populate("authorId", "firstName lastName")
    .select("-__v")
    .lean();

  if (!post) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `Post with id '${blogId}' not found.`,
    );
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

  const likesCount = post.likes?.length || 0;

  let hasLiked = false;

  if (currentUserId) {
    hasLiked = post.likes?.some((id: any) => id.toString() === currentUserId) || false;
  }

  const postResponse: any = {
    ...post,
    likesCount,
    hasLiked,
  };

  delete postResponse.likes;

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, postResponse, "Post fetched successfully"));
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();

  const parsedBody = createPostSchema.parse(req.body);
  const { title, content, tags, published, category, coverImageUrl } = parsedBody;

  const baseSlug = (title || "untitled-draft")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = baseSlug || `draft-${Date.now()}`;
  const existingPost = await Post.findOne({ slug });
  if (existingPost) slug = `${slug}-${Date.now()}`;

  const sanitizedTags: string[] = Array.isArray(tags)
    ? [...new Set(tags.map((t: string) => t.trim()).filter(Boolean))]
    : typeof tags === "string"
      ? [
        ...new Set(
          (tags as string)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      ]
      : [];

  let coverImage = { url: coverImageUrl || "", alt: (title || "Story").trim(), publicId: "" };
  if (req.file) {
    const uploaded = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
    );
    coverImage = {
      url: uploaded.url,
      alt: (title || "Story").trim(),
      publicId: uploaded.publicId,
    };
  }

  const safeTitle = (title || "Untitled Story").trim() || "Untitled Story";

  // Check auto-approve setting
  let setting = await SiteSetting.findOne({ key: 'global' });
  if (!setting) setting = await SiteSetting.create({ key: 'global', autoApprovePost: true });
  const autoApprove = setting.autoApprovePost;

  const postStatus = autoApprove ? 'published' : 'pending';
  const postPublished = autoApprove ? (published === true) : false;

  const post = await Post.create({
    title: safeTitle,
    slug,
    content: (content || "").trim(),
    category: (category || "Uncategorized").trim(),
    coverImage,
    tags: sanitizedTags,
    published: postPublished,
    status: postStatus,
    authorId: userId,
  });

  // If manual approval is required, notify all admins
  if (postStatus === 'pending') {
    const admins = await User.find({ role: 'admin' });
    const notificationPromises = admins.map(admin =>
      Notification.create({
        recipientId: admin._id,
        title: 'New Post Pending Approval',
        message: `A new post "${safeTitle}" has been submitted and requires your review.`,
        type: 'general'
      })
    );
    await Promise.all(notificationPromises);
  }

  const message = autoApprove
    ? 'Post created successfully'
    : 'Post submitted for review. It will be live once approved by admin.';

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, post, message),
    );
});

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "No file uploaded");
  }

  const uploaded = await uploadToCloudinary(
    req.file.buffer,
    req.file.mimetype,
    'blog-media',
    false // isCoverImage = false to prevent strict cropping
  );

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { url: uploaded.url, format: uploaded.format }, "Media uploaded successfully")
  );
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = postParamsSchema.parse(req.params);
  const userId = req.user!._id.toString();

  const parsedBody = updatePostSchema.parse(req.body);

  let sanitizedTags = undefined;
  if (parsedBody.tags) {
    sanitizedTags = Array.isArray(parsedBody.tags)
      ? [
        ...new Set(
          parsedBody.tags.map((t: string) => t.trim()).filter(Boolean),
        ),
      ]
      : typeof parsedBody.tags === "string"
        ? [
          ...new Set(
            (parsedBody.tags as string)
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          ),
        ]
        : [];
  }

  let updatePayload: any = { ...parsedBody };
  if (sanitizedTags) updatePayload.tags = sanitizedTags;

  if (updatePayload.published !== undefined) {
    updatePayload.published =
      updatePayload.published === true || updatePayload.published === "true";
  }

  if (req.file) {
    const uploaded = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
    );
    updatePayload.coverImage = {
      url: uploaded.url,
      alt: parsedBody.title?.trim() || "",
      publicId: uploaded.publicId,
    };
  } else if (parsedBody.coverImageUrl) {
    updatePayload.coverImage = {
      url: parsedBody.coverImageUrl,
      alt: parsedBody.title?.trim() || "",
      publicId: "",
    };
  }

  const post = await Post.findOneAndUpdate(
    { _id: blogId, authorId: userId },
    updatePayload,
    { returnDocument: 'after' },
  );

  if (!post)
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Post not found or you don't have permission",
    );

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, post, "Post updated successfully"));
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = postParamsSchema.parse(req.params);
  const userId = req.user!._id.toString();

  const post = await Post.findOneAndDelete({
    _id: blogId,
    authorId: userId,
  });

  if (!post)
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Post not found or you don't have permission",
    );

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "Post deleted successfully"));
});

export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = postParamsSchema.parse(req.params);
  const userId = req.user!._id;

  const post = await Post.findById(blogId);
  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");

  const hasLiked = post.likes.includes(userId);

  if (hasLiked) {
    post.likes = post.likes.filter(
      (id) => id.toString() !== userId.toString(),
    );
  } else {
    post.likes.push(userId);
  }

  await post.save();
  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        likes: post.likes.length,
        hasLiked: !hasLiked,
      },
      hasLiked ? "Post unliked" : "Post liked",
    ),
  );
});

/**
 * POST /posts/slug/:slug/view
 * Instagram-style view tracking — each unique viewer (user or IP) is counted only once per post.
 * No auth required — works for both logged-in users and anonymous visitors.
 */
import crypto from "crypto";

export const recordView = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) throw new ApiError(StatusCodes.BAD_REQUEST, "Slug required.");

  const post = await Post.findOne({ slug, published: true, status: "published" }).select("+viewedBy");

  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found.");

  // Build a unique viewer fingerprint
  let viewerId: string;

  // Try logged-in user first
  const bearer = req.headers.authorization;
  const tokenFromCookie = req.cookies?.access_token as string | undefined;
  const token = tokenFromCookie || (bearer && bearer.startsWith("Bearer ") ? bearer.split(" ")[1] : undefined);

  if (token) {
    try {
      const payload = verifyAccessToken(token) as { sub: string };
      viewerId = `user:${payload.sub}`;
    } catch {
      // Fallback to IP-based
      const ip = req.ip || req.socket?.remoteAddress || "unknown";
      viewerId = `ip:${crypto.createHash("sha256").update(ip).digest("hex")}`;
    }
  } else {
    // Anonymous visitor — fingerprint by hashed IP
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    viewerId = `ip:${crypto.createHash("sha256").update(ip).digest("hex")}`;
  }

  // Only count if this viewer has NOT already viewed this post
  if (!post.viewedBy.includes(viewerId)) {
    post.viewedBy.push(viewerId);
    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { viewCount: post.viewCount }, "View recorded")
  );
});

/**
 * GET /posts/trending?limit=6
 * Returns top N published posts sorted by viewCount descending.
 */
export const listTrending = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 6, 20);

  const posts = await Post.find({ published: true, status: "published" })
    .populate("authorId", "firstName lastName")
    .sort({ viewCount: -1, createdAt: -1 })
    .limit(limit)
    .select("-viewedBy -__v")
    .lean();

  // Resolve current user for hasLiked
  const bearer = req.headers.authorization;
  const tokenFromCookie = req.cookies?.access_token as string | undefined;
  const token = tokenFromCookie || (bearer && bearer.startsWith("Bearer ") ? bearer.split(" ")[1] : undefined);
  let currentUserId: string | null = null;
  if (token) {
    try {
      const payload = verifyAccessToken(token) as { sub: string };
      currentUserId = payload.sub;
    } catch { /* public route */ }
  }

  const items = posts.map((post: any) => {
    const likesCount = post.likes?.length || 0;
    const hasLiked = currentUserId ? post.likes?.some((id: any) => id.toString() === currentUserId) : false;
    const mapped = { ...post, likesCount, hasLiked };
    delete mapped.likes;
    return mapped;
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { items }, "Trending posts fetched")
  );
});

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  // Run queries in parallel for high performance
  const [blogsCount, readingTimeResult, viewsResult, savedCount] = await Promise.all([
    Post.countDocuments({ authorId: userId }),
    Post.aggregate([
      { $match: { authorId: userId } },
      { $group: { _id: null, total: { $sum: "$readTime" } } }
    ]),
    Post.aggregate([
      { $match: { authorId: userId } },
      { $group: { _id: null, total: { $sum: "$viewCount" } } }
    ]),
    Post.countDocuments({ likes: userId })
  ]);

  const totalReadTime = readingTimeResult[0]?.total || 0;
  const totalViews = viewsResult[0]?.total || 0;

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        blogsCount,
        totalReadTime,
        totalViews,
        savedCount
      },
      "User stats fetched successfully"
    )
  );
});


