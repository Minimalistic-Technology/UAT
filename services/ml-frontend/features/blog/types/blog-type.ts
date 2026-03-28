import { z } from "zod";
import { blogSchema } from "../schema/blog-schema";

export type BlogValues = z.infer<typeof blogSchema>;

export interface BlogResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    tags: string[];
    status: "draft" | "published";
    authorId: string;
    createdAt: string;
    updatedAt: string;
  };
}
