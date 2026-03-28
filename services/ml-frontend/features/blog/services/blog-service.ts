import { api } from "@/lib/api";
import { BlogValues, BlogResponse } from "../types/blog-type";

export const blogService = {
  createBlog: async (data: BlogValues): Promise<BlogResponse> => {
    const response = await api.post("/blogs", data);
    return response.data;
  },
};
