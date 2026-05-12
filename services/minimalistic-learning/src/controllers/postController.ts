import { Request, Response } from "express";
import Post from "../models/Post";
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

  const query: Record<string, unknown> = { published: true };

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

  const post = await Post.create({
    title: safeTitle,
    slug,
    content: (content || "").trim(),
    category: (category || "Uncategorized").trim(),
    coverImage,
    tags: sanitizedTags,
    published: published === true ? true : false,
    authorId: userId,
  });

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, post, "Post created successfully"),
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
