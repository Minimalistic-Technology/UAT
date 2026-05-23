"use client";

import React, { useEffect, useState } from 'react';
import { blogService } from '../services/blog-service';
import { BlogResponse } from '../types/blog-type';
import { BlogCard } from './blog-card';
import { Loader2, Newspaper, ArrowRight, Search } from 'lucide-react';

interface BlogListProps {
  limit?: number;
  hideControls?: boolean;
}

export const BlogList: React.FC<BlogListProps> = ({ limit, hideControls }) => {
  const [blogs, setBlogs] = useState<BlogResponse['data'][]>([]);
  const [paginationInfo, setPaginationInfo] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = limit || 8;
  const [activeFilter, setActiveFilter] = useState('View all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = ['View all', 'Technology', 'Lifestyle', 'Business', 'Education', 'AI & Future'];

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
          if (activeFilter !== 'View all') params.category = activeFilter;
          if (searchQuery.trim()) params.q = searchQuery.trim();
        }

        const response = await blogService.getBlogs(params);
        if (response.success && response.data) {
          setBlogs(response.data.items);
          setPaginationInfo(response.data.pagination);
        } else {
          setError(response.message || 'Failed to fetch blogs');
        }
      } catch (err: any) {
        console.error('Error fetching blogs:', err);
        const serverMsg = err?.response?.data?.message || 'Something went wrong while fetching blogs.';
        setError(serverMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentPage, activeFilter, searchQuery, itemsPerPage, limit, hideControls]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (!limit) setCurrentPage(1);
  }, [activeFilter, searchQuery, limit]);

  const processedBlogs = React.useMemo(() => {
    let result = [...blogs];

    if (sortBy === 'Newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'Oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'Title A-Z') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [blogs, sortBy]);

  if (error) {
    return (
      <div className="text-center py-20 px-6 bg-red-50/50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30">
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {!hideControls && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2.5">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === filter
                  ? 'bg-blue-600 text-white shadow-sm dark:shadow-none'
                  : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-300 dark:focus:border-blue-500/50 transition-all placeholder:text-gray-400 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:border-blue-300 dark:focus:border-blue-500/50 transition-all cursor-pointer appearance-none shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none"
            >
              <option>Newest</option>
              <option>Oldest</option>
              <option>Title A-Z</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-[1.5rem] aspect-[16/10] animate-pulse border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50" />
          ))}
        </div>
      ) : processedBlogs.length === 0 ? (
        <div className="text-center py-32 px-6 bg-gray-50/50 dark:bg-gray-900/20 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-8 border border-white dark:border-gray-700 shadow-sm">
            <Newspaper className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No stories found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
            We couldn't find any stories in the "{activeFilter}" category. Try exploring other topics!
          </p>
          <button
            onClick={() => setActiveFilter('View all')}
            className="px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-md"
          >
            View All Stories
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
            {processedBlogs.map((blog) => (
              <BlogCard key={blog.id || blog._id} blog={blog} />
            ))}
          </div>

          {/* Pagination Controls */}
          {!limit && paginationInfo && paginationInfo.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!paginationInfo.hasPrevPage}
                className="p-2 w-10 h-10 rounded-full border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ArrowRight className="rotate-180" size={18} />
              </button>

              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: paginationInfo.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${currentPage === page
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(paginationInfo.totalPages, prev + 1))}
                disabled={!paginationInfo.hasNextPage}
                className="p-2 w-10 h-10 rounded-full border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
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
