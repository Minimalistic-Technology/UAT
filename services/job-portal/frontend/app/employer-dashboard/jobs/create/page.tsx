"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, GraduationCap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobForm } from "@/features/employer/components/job-form";
import { InternshipForm } from "@/features/employer/components/internship-form";
import { ListingType } from "@/types/enums";


function PostListingPage() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>(ListingType.JOB);

  return (
    <div className="w-full max-w-5xl">
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
          <TabsTrigger value={ListingType.JOB} className="flex items-center gap-2">
            <Briefcase className="size-4" /> Job
          </TabsTrigger>
          <TabsTrigger value={ListingType.INTERNSHIP} className="flex items-center gap-2">
            <GraduationCap className="size-4" /> Internship
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {listingType === ListingType.JOB ? (
        <JobForm onCancel={() => router.back()} />
      ) : (
        <InternshipForm onCancel={() => router.back()} />
      )}
    </div>
  );
}

export default PostListingPage;