import { Request, Response } from "express";
import { prisma } from "../config/db";
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
import crypto from 'crypto';

// SQLite-compatible string constants (replaces Prisma enums)
const POST_STATUS = { pending: 'pending', published: 'published', rejected: 'rejected' } as const;
const NOTIFICATION_TYPE = { general: 'general', post_approved: 'post_approved', post_rejected: 'post_rejected', post_deleted: 'post_deleted' } as const;

// SQLite array helpers (arrays stored as JSON strings)
const parseArr = (val: string | null | undefined): string[] => {
  try { return JSON.parse(val || '[]'); } catch { return []; }
};
const stringifyArr = (arr: string[]): string => JSON.stringify(arr);

export const listPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const { tag, q, category } = req.query;

  const where: any = { published: true, status: POST_STATUS.published };

  if (tag) where.tags = { contains: `"${String(tag)}"` }; // SQLite JSON-string search
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: String(q) } },
      { content: { contains: String(q) } }
    ];
  }

  const skip = (page - 1) * limit;

  const [itemsRaw, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { author: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.post.count({ where }),
  ]);

  const items = itemsRaw.map(item => ({ ...item, authorId: item.author }));

  const bearer = req.headers.authorization;
  const tokenFromCookie = req.cookies?.access_token as string | undefined;
  const token = tokenFromCookie || (bearer && bearer.startsWith('Bearer ') ? bearer.split(" ")[1] : undefined);

  let currentUserId: string | null = null;
  if (token) {
    try {
      const payload = verifyAccessToken(token) as { sub: string };
      currentUserId = payload.sub;
    } catch { }
  }

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const itemsResponse = items.map((post: any) => {
    const likesArr = parseArr(post.likes);
    const likesCount = likesArr.length;
    const hasLiked = currentUserId ? likesArr.includes(currentUserId) : false;

    const coverImageObj = post.coverImage ? JSON.parse(post.coverImage) : null;
    const mappedPost = { ...post, likesCount, hasLiked, coverImage: coverImageObj };
    delete mappedPost.likes;
    return mappedPost;
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        items: itemsResponse,
        pagination: {
          total, totalPages, currentPage: page, limit, hasNextPage, hasPrevPage,
        },
      },
      "Posts fetched successfully",
    ),
  );
});

export const listMyPosts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id || (req.user as any)._id.toString();
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const where = { authorId: userId };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const itemsResponse = items.map((post: any) => {
    const likesArr = parseArr(post.likes);
    const likesCount = likesArr.length;
    const hasLiked = likesArr.includes(userId);

    const coverImageObj = post.coverImage ? JSON.parse(post.coverImage) : null;
    const mappedPost = { ...post, likesCount, hasLiked, coverImage: coverImageObj };
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
        pagination: { total, totalPages, currentPage: page, limit, hasNextPage, hasPrevPage },
      },
      "My posts fetched successfully",
    ),
  );
});

export const getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) throw new ApiError(StatusCodes.BAD_REQUEST, "Slug parameter is required.");

  try {
    let post: any = await prisma.post.findFirst({
      where: { slug, published: true, status: POST_STATUS.published },
      include: { author: { select: { firstName: true, lastName: true } } }
    });

    if (!post) throw new ApiError(StatusCodes.NOT_FOUND, `Post with slug '${slug}' not found.`);

    // Workaround for potential database null arrays (now JSON strings in SQLite)
    const likes = parseArr(post.likes);
    const viewedBy = parseArr(post.viewedBy);
    const tags = parseArr(post.tags);

    const bearer = req.headers.authorization;
    const tokenFromCookie = req.cookies?.access_token as string | undefined;
    const token = tokenFromCookie || (bearer && bearer.startsWith('Bearer ') ? bearer.split(" ")[1] : undefined);

    let currentUserId: string | null = null;
    if (token) {
      try {
        const payload = verifyAccessToken(token) as { sub: string };
        currentUserId = payload.sub;
      } catch { }
    }

    const likesCount = likes.length;
    let hasLiked = false;

    if (currentUserId) {
      hasLiked = likes.includes(currentUserId);
    }

    // Ensure authorId fallback to empty object if author is null
    const authorData = post.author || { firstName: "Unknown", lastName: "Author" };

    const coverImageObj = post.coverImage ? JSON.parse(post.coverImage) : null;

    const postResponse = {
      ...post,
      likesCount,
      hasLiked,
      likes,
      viewedBy,
      tags,
      authorId: authorData,
      coverImage: coverImageObj
    };

    delete postResponse.likes;

    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, postResponse, "Post fetched successfully"));
  } catch (error: any) {
    console.error("Error in getPostBySlug:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error?.message || "Internal Server Error during post retrieval");
  }
});

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = postParamsSchema.parse(req.params);

  let post: any = await prisma.post.findUnique({
    where: { id: blogId },
    include: { author: { select: { firstName: true, lastName: true } } }
  });

  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, `Post with id '${blogId}' not found.`);

  post = { ...post, authorId: post.author };

  const bearer = req.headers.authorization;
  const tokenFromCookie = req.cookies?.access_token as string | undefined;
  const token = tokenFromCookie || (bearer && bearer.startsWith('Bearer ') ? bearer.split(" ")[1] : undefined);

  let currentUserId: string | null = null;
  if (token) {
    try {
      const payload = verifyAccessToken(token) as { sub: string };
      currentUserId = payload.sub;
    } catch { }
  }

  const likesArr = parseArr(post.likes);
  const likesCount = likesArr.length;
  let hasLiked = false;

  if (currentUserId) {
    hasLiked = likesArr.includes(currentUserId);
  }

  const coverImageObj = post.coverImage ? JSON.parse(post.coverImage) : null;
  const postResponse = { ...post, likesCount, hasLiked, coverImage: coverImageObj };
  delete postResponse.likes;

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, postResponse, "Post fetched successfully"));
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id || (req.user as any)._id.toString();
  const parsedBody = createPostSchema.parse(req.body);
  const { title, content, tags, published, category, coverImageUrl } = parsedBody;

  const baseSlug = (title || "untitled-draft").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  let slug = baseSlug || `draft-${Date.now()}`;
  const existingPost = await prisma.post.findUnique({ where: { slug } });
  if (existingPost) slug = `${slug}-${Date.now()}`;

  const sanitizedTags: string[] = Array.isArray(tags)
    ? [...new Set(tags.map((t: string) => t.trim()).filter(Boolean))]
    : typeof tags === "string"
      ? [...new Set((tags as string).split(",").map((t) => t.trim()).filter(Boolean))]
      : [];

  let coverImage = { url: coverImageUrl || "", alt: (title || "Story").trim(), publicId: "" };
  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    coverImage = { url: uploaded.url, alt: (title || "Story").trim(), publicId: uploaded.publicId };
  }

  const safeTitle = (title || "Untitled Story").trim() || "Untitled Story";

  let setting = await prisma.siteSetting.findUnique({ where: { key: 'global' } });
  if (!setting) {
    setting = await prisma.siteSetting.create({ data: { key: 'global', autoApprovePost: true } });
  }
  const autoApprove = setting.autoApprovePost;

  const postStatus = autoApprove ? POST_STATUS.published : POST_STATUS.pending;
  const postPublished = autoApprove ? (published === true) : false;

  const post = await prisma.post.create({
    data: {
      title: safeTitle,
      slug,
      content: (content || "").trim(),
      category: (category || "Uncategorized").trim(),
      coverImage: coverImage ? JSON.stringify(coverImage) : null,
      tags: stringifyArr(sanitizedTags),
      published: postPublished,
      status: postStatus,
      authorId: userId,
    }
  });

  if (postStatus === POST_STATUS.pending) {
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          recipientId: admin.id,
          title: 'New Post Pending Approval',
          message: `A new post "${safeTitle}" has been submitted and requires your review.`,
          type: NOTIFICATION_TYPE.general
        }
      });
    }
  }

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, post, autoApprove ? 'Post created successfully' : 'Post submitted for review. It will be live once approved by admin.')
  );
});

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(StatusCodes.BAD_REQUEST, "No file uploaded");

  const uploaded = await uploadToCloudinary(
    req.file.buffer,
    req.file.mimetype,
    'blog-media',
    false
  );

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { url: uploaded.url, format: uploaded.format }, "Media uploaded successfully")
  );
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = postParamsSchema.parse(req.params);
  const userId = req.user!.id || (req.user as any)._id.toString();

  const parsedBody = updatePostSchema.parse(req.body);

  let sanitizedTags: string[] | undefined = undefined;
  if (parsedBody.tags) {
    sanitizedTags = Array.isArray(parsedBody.tags)
      ? [...new Set(parsedBody.tags.map((t: string) => t.trim()).filter(Boolean))]
      : typeof parsedBody.tags === "string"
        ? [...new Set((parsedBody.tags as string).split(",").map((t) => t.trim()).filter(Boolean))]
        : [];
  }

  let updatePayload: any = { ...parsedBody };
  if (sanitizedTags) updatePayload.tags = sanitizedTags;

  let setting = await prisma.siteSetting.findUnique({ where: { key: 'global' } });
  if (!setting) {
    setting = await prisma.siteSetting.create({ data: { key: 'global', autoApprovePost: true } });
  }
  const autoApprove = setting?.autoApprovePost ?? true;

  if (updatePayload.published !== undefined) {
    updatePayload.published = updatePayload.published === true || updatePayload.published === "true";
    if (updatePayload.published) {
      if (!autoApprove) {
        updatePayload.status = POST_STATUS.pending;
        updatePayload.published = false;

        const admins = await prisma.user.findMany({ where: { role: 'admin' } });
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              recipientId: admin.id,
              title: 'Updated Post Pending Approval',
              message: `The post "${parsedBody.title || 'Untitled Post'}" has been updated and requires review.`,
              type: NOTIFICATION_TYPE.general
            }
          });
        }
      } else {
        updatePayload.status = POST_STATUS.published;
      }
    }
  }

  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    updatePayload.coverImage = JSON.stringify({ url: uploaded.url, alt: parsedBody.title?.trim() || "", publicId: uploaded.publicId });
  } else if (parsedBody.coverImageUrl) {
    updatePayload.coverImage = JSON.stringify({ url: parsedBody.coverImageUrl, alt: parsedBody.title?.trim() || "", publicId: "" });
  }

  if (sanitizedTags) updatePayload.tags = stringifyArr(sanitizedTags);

  delete updatePayload.coverImageUrl;

  const post = await prisma.post.updateMany({
    where: { id: blogId, authorId: userId },
    data: updatePayload
  });

  if (post.count === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found or you don't have permission");
  }

  const updatedPost = await prisma.post.findUnique({ where: { id: blogId } });

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, updatedPost, "Post updated successfully"));
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = postParamsSchema.parse(req.params);
  const userId = req.user!.id || (req.user as any)._id.toString();

  const count = await prisma.post.deleteMany({
    where: { id: blogId, authorId: userId }
  });

  if (count.count === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found or you don't have permission");

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, null, "Post deleted successfully"));
});

export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = postParamsSchema.parse(req.params);
  const userId = req.user!.id || (req.user as any)._id.toString();

  const post = await prisma.post.findUnique({ where: { id: blogId } });
  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");

  const currentLikes = parseArr(post.likes);
  const hasLiked = currentLikes.includes(userId);
  const updatedLikes = hasLiked
    ? currentLikes.filter((id) => id !== userId)
    : [...currentLikes, userId];

  await prisma.post.update({
    where: { id: blogId },
    data: { likes: stringifyArr(updatedLikes) }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { likes: updatedLikes.length, hasLiked: !hasLiked }, hasLiked ? "Post unliked" : "Post liked")
  );
});

export const recordView = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) throw new ApiError(StatusCodes.BAD_REQUEST, "Slug required.");

  const post = await prisma.post.findFirst({
    where: { slug, published: true, status: POST_STATUS.published }
  });

  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found.");

  let viewerId: string;
  const bearer = req.headers.authorization;
  const tokenFromCookie = req.cookies?.access_token as string | undefined;
  const token = tokenFromCookie || (bearer && bearer.startsWith("Bearer ") ? bearer.split(" ")[1] : undefined);

  if (token) {
    try {
      const payload = verifyAccessToken(token) as { sub: string };
      viewerId = `user:${payload.sub}`;
    } catch {
      const ip = req.ip || req.socket?.remoteAddress || "unknown";
      viewerId = `ip:${crypto.createHash("sha256").update(ip).digest("hex")}`;
    }
  } else {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    viewerId = `ip:${crypto.createHash("sha256").update(ip).digest("hex")}`;
  }

  const viewedByArr = parseArr(post.viewedBy);
  if (!viewedByArr.includes(viewerId)) {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        viewedBy: stringifyArr([...viewedByArr, viewerId]),
        viewCount: { increment: 1 }
      }
    });
    post.viewCount++;
  }

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, { viewCount: post.viewCount }, "View recorded"));
});

export const listTrending = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 6, 20);

  const postsRaw = await prisma.post.findMany({
    where: { published: true, status: POST_STATUS.published },
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
    take: limit
  });

  const posts = postsRaw.map(item => ({ ...item, authorId: item.author }));

  const bearer = req.headers.authorization;
  const tokenFromCookie = req.cookies?.access_token as string | undefined;
  const token = tokenFromCookie || (bearer && bearer.startsWith("Bearer ") ? bearer.split(" ")[1] : undefined);
  let currentUserId: string | null = null;
  if (token) {
    try {
      const payload = verifyAccessToken(token) as { sub: string };
      currentUserId = payload.sub;
    } catch { }
  }

  const items = posts.map((post: any) => {
    const likesArr = parseArr(post.likes);
    const likesCount = likesArr.length;
    const hasLiked = currentUserId ? likesArr.includes(currentUserId) : false;
    const mapped = { ...post, likesCount, hasLiked };
    delete mapped.viewedBy;
    delete mapped.likes;
    return mapped;
  });

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, { items }, "Trending posts fetched"));
});

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id || (req.user as any)._id.toString();

  const [blogsCount, savedCount, aggregates] = await Promise.all([
    prisma.post.count({ where: { authorId: userId } }),
    prisma.post.count({ where: { likes: { contains: `"${userId}"` } } }),
    prisma.post.aggregate({
      where: { authorId: userId },
      _sum: { readTime: true, viewCount: true }
    })
  ]);

  const totalReadTime = aggregates._sum.readTime || 0;
  const totalViews = aggregates._sum.viewCount || 0;

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, { blogsCount, totalReadTime, totalViews, savedCount }, "User stats fetched successfully"));
});


