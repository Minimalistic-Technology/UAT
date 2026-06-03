"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { useGetInternshipPostById } from "@/features/employer/hooks/use-internship";
import { InternshipForm } from "@/features/employer/components/internship-form";
import { Button } from "@/components/ui/button";

const EditInternshipPage = () => {
  const params = useParams();
  const router = useRouter();
  const internshipId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetInternshipPostById(internshipId as string);

  const internship = responseData?.data;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
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

  if (isError || !internship) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        Internship not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Edit Internship Listing
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Update the details of your internship posting below.
          </p>
        </div>
      </div>

      <InternshipForm onCancel={() => router.back()} initialData={internship} />
    </div>
  );
};

export default EditInternshipPage;
