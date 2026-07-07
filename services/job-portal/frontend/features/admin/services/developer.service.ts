import api, { ApiSuccessResponse } from "@/lib/api-client";

export const getDbCollections = async () => {
  const res = await api.get<ApiSuccessResponse<string[]>>(
    "/admin/developer/collections",
  );
  return res.data;
};

export const runDbQuery = async (query: string) => {
  const res = await api.post<ApiSuccessResponse<any>>(
    "/admin/developer/query",
    { query },
  );
  return res.data;
};
