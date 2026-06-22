import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const RecentApplicationsSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-[20px] border-0 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-56 rounded-lg" />
          <Skeleton className="h-4 w-40 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-24 rounded-lg" />
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full min-w-[700px] text-sm whitespace-nowrap">
          <TableHeader>
            <TableRow className="border-border/50 text-muted-foreground border-b text-left text-xs font-bold tracking-wider uppercase hover:bg-transparent">
              <TableHead className="pr-4 pb-3">Candidate</TableHead>
              <TableHead className="px-4 pb-3">Position</TableHead>
              <TableHead className="px-4 pb-3">Type</TableHead>
              <TableHead className="px-4 pb-3">State</TableHead>
              <TableHead className="pb-3 pl-4 text-right">
                Applied Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow
                key={i}
                className="border-border/30 hover:bg-muted/10 border-b transition-colors last:border-0"
              >
                <TableCell className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32 rounded-lg" />
                      <Skeleton className="h-3 w-24 rounded-lg" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Skeleton className="h-4 w-32 rounded-lg" />
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Skeleton className="h-4 w-20 rounded-lg" />
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell className="py-4 pl-4 text-right">
                  <Skeleton className="ml-auto h-4 w-32 rounded-lg" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
