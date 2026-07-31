"use client";

import React, { useEffect, useState } from "react";
import { blogService } from "../services/blog-service";
import { BlogResponse } from "../types/blog-type";
import { BlogCard } from "./blog-card";
import { Loader2, Newspaper, ArrowRight, Search } from "lucide-react";
import { ErrorRetryBlock } from "@/components/ui/ErrorRetryBlock";

interface BlogListProps {
  limit?: number;
  hideControls?: boolean;
}

export const BlogList: React.FC<BlogListProps> = ({ limit, hideControls }) => {
  const [blogs, setBlogs] = useState<BlogResponse["data"][]>([]);
  const [paginationInfo, setPaginationInfo] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = limit || 8;
  const [activeFilter, setActiveFilter] = useState("View all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = [
    "View all",
    "Technology",
    "Lifestyle",
    "Business",
    "Education",
    "AI & Future",
  ];

  // Debounce search query changes to prevent API spam and unnecessary re-fetches
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: limit ? 1 : currentPage,
          limit: itemsPerPage,
        };

        if (!hideControls) {
          if (activeFilter !== "View all") params.category = activeFilter;
          if (searchQuery.trim()) params.q = searchQuery.trim();
        }

        const response = await blogService.getBlogs(params);
        if (response.success && response.data) {
          setBlogs(response.data.items);
          setPaginationInfo(response.data.pagination);
        } else {
          setError(response.message || "Failed to fetch blogs");
        }
      } catch (err: any) {
        console.error("Error fetching blogs:", err);
        const serverMsg =
          err?.response?.data?.message ||
          "Something went wrong while fetching blogs.";
        setError(serverMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [
    currentPage,
    activeFilter,
    searchQuery,
    itemsPerPage,
    limit,
    hideControls,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (!limit) setCurrentPage(1);
  }, [activeFilter, searchQuery, limit]);

  const processedBlogs = React.useMemo(() => {
    let result = [...blogs];

    if (sortBy === "Newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
    } else if (sortBy === "Oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime(),
      );
    } else if (sortBy === "Title A-Z") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [blogs, sortBy]);

  if (error) {
    return (
      <ErrorRetryBlock
        error={{ message: error }}
        message="Went something wrong"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-12">
      {!hideControls && (
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2.5">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white shadow-sm dark:shadow-none"
                    : "border border-gray-100 bg-white text-gray-500 hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 lg:w-64">
              <Search
                className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white py-2.5 pr-5 pl-11 text-sm font-medium text-gray-900 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all placeholder:text-gray-400 focus:border-blue-300 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:shadow-none dark:focus:border-blue-500/50"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="cursor-pointer appearance-none rounded-full border border-gray-100 bg-white py-2.5 pr-10 pl-4 text-sm font-bold text-gray-600 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all focus:border-blue-300 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:shadow-none dark:focus:border-blue-500/50"
            >
              <option>Newest</option>
              <option>Oldest</option>
              <option>Title A-Z</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-[16/10] animate-pulse rounded-[1.5rem] border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50"
            />
          ))}
        </div>
      ) : processedBlogs.length === 0 ? (
        <div className="rounded-[3rem] border border-dashed border-gray-200 bg-gray-50/50 px-6 py-32 text-center dark:border-gray-800 dark:bg-gray-900/20">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full border border-white bg-gray-100 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <Newspaper className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            No stories found
          </h3>
          <p className="mx-auto mb-8 max-w-sm text-gray-500 dark:text-gray-400">
            We couldn't find any stories in the "{activeFilter}" category. Try
            exploring other topics!
          </p>
          <button
            onClick={() => setActiveFilter("View all")}
            className="rounded-full bg-gray-900 px-8 py-3.5 text-sm font-bold text-white shadow-md transition-transform dark:bg-white dark:text-gray-900"
          >
            View All Stories
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col space-y-16">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {processedBlogs.map((blog) => (
              <BlogCard key={blog.id || blog._id} blog={blog} />
            ))}
          </div>

          {/* Pagination Controls */}
          {!limit && paginationInfo && paginationInfo.totalPages > 1 && (
            <div className="mt-auto flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!paginationInfo.hasPrevPage}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 p-2 text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <ArrowRight className="rotate-180" size={18} />
              </button>

              <div className="mx-2 flex items-center gap-1">
                {Array.from(
                  { length: paginationInfo.totalPages },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 w-10 rounded-full text-sm font-bold transition-all ${
                      currentPage === page
                        ? "bg-gray-900 text-white shadow-md dark:bg-white dark:text-gray-900"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(paginationInfo.totalPages, prev + 1),
                  )
                }
                disabled={!paginationInfo.hasNextPage}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 p-2 text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
