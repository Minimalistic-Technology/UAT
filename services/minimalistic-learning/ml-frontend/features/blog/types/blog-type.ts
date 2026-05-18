import { z } from "zod";
import { blogSchema } from "../schema/blog-schema";

export type BlogValues = z.infer<typeof blogSchema>;

export interface BlogResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    coverImage: {
      url: string;
      alt?: string;
      publicId?: string;
    };
    coverImageUrl?: string;
    tags: string[];
    status: "draft" | "published";
    category: string;
    published: boolean;
    authorId: string | { _id: string; firstName: string; lastName: string };
    likesCount?: number;
    hasLiked?: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface BlogListResponse {
  success: boolean;
  message: string;
  data: {
    items: BlogResponse["data"][];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface Comment {
  _id: string;
  postId: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  likesCount: number;
  hasLiked: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentListResponse {
  success: boolean;
  message: string;
  data: Comment[];
}
