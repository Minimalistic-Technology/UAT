"use client";
import { useAuth } from "@/hooks/useAuth";
import { jobService } from "@/lib/services/job.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { JobCard } from "./JobCard";

const Page = () => {
  const queryClient = useQueryClient();
  const { user, data: session, status } = useAuth();
  console.log("user", user);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["my-jobs"],
    queryFn: () => jobService.getMyJobs(),
  });

  console.log("Jobs: ", jobs);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            My Job Listings
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Manage and track your posted jobs and applications.
          </p>
        </div>

        {!jobs?.data || jobs.data.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500 max-w-sm mb-6">
              You haven't posted any jobs yet. Create your first job posting to
              start receiving applications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {jobs.data.map((job: any) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
