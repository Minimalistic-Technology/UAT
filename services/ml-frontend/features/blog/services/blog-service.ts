import { api } from "@/lib/api";
import { BlogValues, BlogResponse, BlogListResponse, CommentListResponse } from "../types/blog-type";

export const blogService = {
  createBlog: async (data: BlogValues): Promise<BlogResponse> => {
    const response = await api.post("/posts", data);
    return response.data;
  },
  getBlogs: async (params?: { page?: number; limit?: number; tag?: string; category?: string; q?: string }): Promise<BlogListResponse> => {
    const response = await api.get("/posts", { params });
    return response.data;
  },
  getBlogById: async (id: string): Promise<BlogResponse> => {
    const response = await api.get(`/posts/id/${id}`);
    return response.data;
  },
  getBlogBySlug: async (slug: string): Promise<BlogResponse> => {
    const response = await api.get(`/posts/slug/${slug}`);
    return response.data;
  },
  updateBlog: async ({ id, data }: { id: string; data: Partial<BlogValues> }): Promise<BlogResponse> => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },
  deleteBlog: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },
  getMyBlogs: async (params?: { page?: number; limit?: number }): Promise<BlogListResponse> => {
    const response = await api.get("/posts/my", { params });
    return response.data;
  },
  upvotePost: async (id: string): Promise<any> => {
    const response = await api.post(`/posts/${id}/upvote`);
    return response.data;
  },
  downvotePost: async (id: string): Promise<any> => {
    const response = await api.post(`/posts/${id}/downvote`);
    return response.data;
  },
  getComments: async (postId: string): Promise<CommentListResponse> => {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  },
  createComment: async (postId: string, content: string): Promise<any> => {
    const response = await api.post(`/comments/post/${postId}`, { content });
    return response.data;
  }
};
