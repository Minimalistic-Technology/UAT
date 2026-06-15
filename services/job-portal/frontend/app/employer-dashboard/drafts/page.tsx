"use client";
import Link from "next/link";
import { FileEdit, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { GlobalSearchInput } from "@/components/global-search-input";
import { DraftRow } from "@/features/employer/components/draft-row";
import { useGetDrafts } from "@/features/employer/hooks/use-draft";

const DraftsPage = () => {
  const { data: responseData, isLoading, isError } = useGetDrafts();
  const [searchQuery, setSearchQuery] = useState("");

  const draftsRaw = responseData?.data || [];

  const drafts = useMemo(() => {
    if (!searchQuery.trim()) return draftsRaw;
    const lowerQuery = searchQuery.toLowerCase();
    return draftsRaw.filter((draft: any) =>
      draft.formData?.title?.toLowerCase().includes(lowerQuery)
    );
  }, [draftsRaw, searchQuery]);

  if (isLoading) {
    return <DraftTableSkeleton />;
  }

  if (isError) {
    return <div>Error occurred while fetching drafts.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm flex-1">
          <GlobalSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search drafts..."
          />
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href="/employer-dashboard/listings/create" className="flex items-center justify-center">
            <Plus className="mr-2 h-4 w-4 shrink-0" />
            <span>Post New Job</span>
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-4 pt-6 px-7">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Saved Drafts</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Pick up where you left off. Edit and publish your drafts.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-7 pb-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[40%] font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Last Saved</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drafts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                ) : (
                  drafts.map((draft: any) => (
                    <DraftRow key={draft._id} draft={draft} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DraftsPage;

function DraftTableSkeleton() {
  return (
    <Card className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)] mt-14">
      <CardHeader className="pb-4 pt-6 px-7 flex flex-row justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-10 w-28" />
      </CardHeader>

      <CardContent className="px-7 pb-6">
        <div className="space-y-4 rounded-md border p-4">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
        <FileEdit className="h-10 w-10 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">No drafts found</h3>
      <p className="mt-1 max-w-[300px] text-center text-sm text-gray-500">
        You don't have any saved drafts.
      </p>
    </div>
  );
}
