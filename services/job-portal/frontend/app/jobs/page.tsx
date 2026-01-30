'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/app/lib/services/job.service';
import JobCard from '@/app/components/JobCard';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { JobType, ExperienceLevel } from '@/app/types';
import { Search, Filter, Loader2 } from 'lucide-react';

export default function JobsPage() {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    remote: false,
    page: 1,
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.getJobs(filters),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Jobs</h1>
        <p className="text-gray-600">
          Discover {data?.total || 0} job opportunities
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Job title, keywords, or company"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="City, state, or remote"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
            <Button type="submit" className="md:w-auto">
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
              >
                <option value="">All Types</option>
                {Object.values(JobType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
              >
                <option value="">All Levels</option>
                {Object.values(ExperienceLevel).map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="remote"
                type="checkbox"
                checked={filters.remote}
                onChange={(e) => handleFilterChange('remote', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remote" className="ml-2 block text-sm text-gray-900">
                Remote only
              </label>
            </div>
          </div>
        )}
      </Card>

      {/* Job Listings */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : error ? (
        <Card className="text-center py-12">
          <p className="text-red-600">Error loading jobs. Please try again.</p>
        </Card>
      ) : data?.data.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600">No jobs found. Try adjusting your filters.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {data?.data.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-gray-700">
                Page {filters.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={filters.page === data.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}