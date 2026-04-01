"use client";

import React, { useEffect, useState } from 'react';
import { blogService } from '../services/blog-service';
import { BlogResponse } from '../types/blog-type';
import { BlogCard } from './blog-card';
import { Loader2, Newspaper, ArrowRight } from 'lucide-react';

export const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogResponse['data'][]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogResponse['data'][]>([]);
  const [activeFilter, setActiveFilter] = useState('View all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = ['View all', 'Marketing Tips', 'Business Strategies', 'Industry Insights', 'Client Success', 'Finance'];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogService.getBlogs({ page: 1, limit: 20 });
        if (response.success && response.data) {
          setBlogs(response.data.items);
          setFilteredBlogs(response.data.items);
        } else {
          setError(response.message || 'Failed to fetch blogs');
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Something went wrong while fetching blogs.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    if (activeFilter === 'View all') {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(blog => 
        blog.category === activeFilter || 
        blog.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
  }, [activeFilter, blogs]);

  if (loading) {
    return (
      <div className="space-y-12">
        {/* Skeleton Filters */}
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-24 h-10 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-50 rounded-[1.5rem] aspect-[16/10] animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-6 bg-red-50/50 rounded-3xl border border-red-100">
        <h3 className="text-lg font-bold text-red-600 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-600 max-w-md mx-auto">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === filter
                ? 'bg-[#1877F2] text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredBlogs.length === 0 ? (
        <div className="text-center py-32 px-6 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-8">
            <Newspaper className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No stories found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            We couldn't find any stories in the "{activeFilter}" category. Try exploring other topics!
          </p>
          <button 
            onClick={() => setActiveFilter('View all')}
            className="px-8 py-3.5 bg-gray-900 text-white rounded-full font-bold text-sm hover:scale-105 transition-all"
          >
            View All Stories
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
          {filteredBlogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};
