"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { useGetJobPostById } from "@/features/employer/hooks/use-job";
import { JobForm } from "@/features/employer/components/job-form";
import { Button } from "@/components/ui/button";

const EditJobPage = () => {
  const params = useParams();
  const router = useRouter();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetJobPostById(jobId as string);

  const job = responseData?.data;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        Job not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Edit Job Listing
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Update the details of your job posting below.
          </p>
        </div>
      </div>

      <JobForm onCancel={() => router.back()} initialData={job} />
    </div>
  );
};

export default EditJobPage;
