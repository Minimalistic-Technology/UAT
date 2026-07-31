type PaginationQuery = {
  page?: number;
  limit?: number;
};

export function getPagination(query: PaginationQuery) {
  const page =
    typeof query.page === "string"
      ? Math.max(1, parseInt(query.page, 10) || 1)
      : 1;

  const limit =
    typeof query.limit === "string"
      ? Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10))
      : 10;

  return { page, limit };
}
