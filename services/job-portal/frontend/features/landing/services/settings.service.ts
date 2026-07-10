import apiClient from "@/lib/api-client";

export const getLandingSettings = async (title?: string) => {
  const url = title ? `/settings/landing?title=${title}` : `/settings/landing`;
  const response = await apiClient.get(url);
  return response.data;
};
