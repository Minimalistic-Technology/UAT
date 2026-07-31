"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, GraduationCap, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobForm } from "@/features/employer/components/job-form";
import { InternshipForm } from "@/features/employer/components/internship-form";
import { ListingType } from "@/types/enums";
import { useGetDraftById } from "@/features/employer/hooks/use-draft";

function PostListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId") || undefined;
  const draftTypeParam = searchParams.get("type");

  const [listingType, setListingType] = useState<ListingType>(
    draftTypeParam === "internship" ? ListingType.INTERNSHIP : ListingType.JOB,
  );

  const { data: draftResponse, isLoading } = useGetDraftById(draftId);
  const draftData = draftResponse?.data?.formData;

  useEffect(() => {
    if (draftTypeParam === "internship") {
      setListingType(ListingType.INTERNSHIP);
    } else if (draftTypeParam === "job") {
      setListingType(ListingType.JOB);
    }
  }, [draftTypeParam]);

  if (draftId && isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center px-[3px] py-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="text-muted-foreground ml-2 text-lg">
          Loading draft...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full px-[3px] py-4">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
          {draftId ? "Edit Draft" : "Post a New Listing"}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {draftId
            ? "Pick up where you left off."
            : "Choose whether you're hiring for a job or an internship."}
        </p>
      </div>

      {/* Listing type toggle */}
      <Tabs
        value={listingType}
        onValueChange={(val) => setListingType(val as ListingType)}
        className="mb-8"
      >
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger
            value={ListingType.JOB}
            className="flex items-center gap-2"
          >
            <Briefcase className="size-4" /> Job
          </TabsTrigger>
          <TabsTrigger
            value={ListingType.INTERNSHIP}
            className="flex items-center gap-2"
          >
            <GraduationCap className="size-4" /> Internship
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {listingType === ListingType.JOB ? (
        <JobForm
          onCancel={() => router.back()}
          draftId={draftId}
          draftData={draftData}
        />
      ) : (
        <InternshipForm
          onCancel={() => router.back()}
          draftId={draftId}
          draftData={draftData}
        />
      )}
    </div>
  );
}

function PostListingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] w-full items-center justify-center px-[3px] py-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="text-muted-foreground ml-2 text-lg">Loading...</span>
        </div>
      }
    >
      <PostListingContent />
    </Suspense>
  );
}

export default PostListingPage;
