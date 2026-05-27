"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, GraduationCap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobForm } from "@/features/employer/components/job-form";
import { InternshipForm } from "@/features/employer/components/internship-form";

type ListingType = "job" | "internship";


function PostListingPage() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>("job");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Post a New Listing
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Choose whether you're hiring for a job or an internship.
        </p>
      </div>

      {/* Listing type toggle */}
      <Tabs
        value={listingType}
        onValueChange={(val) => setListingType(val as ListingType)}
        className="mb-8"
      >
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="job" className="flex items-center gap-2">
            <Briefcase className="size-4" /> Job
          </TabsTrigger>
          <TabsTrigger value="internship" className="flex items-center gap-2">
            <GraduationCap className="size-4" /> Internship
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {listingType === "job" ? (
        <JobForm onCancel={() => router.back()} />
      ) : (
        <InternshipForm onCancel={() => router.back()} />
      )}
    </div>
  );
}

export default PostListingPage;