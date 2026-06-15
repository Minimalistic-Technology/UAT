import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useDeleteDraft } from "../hooks/use-draft";

export function DraftRow({ draft }: { draft: any }) {
  const router = useRouter();
  const { mutate: deleteDraft, isPending: isDeleting } = useDeleteDraft();

  const title = draft.formData?.title || "Untitled Draft";
  const typeLabel = draft.type === "job" ? "Job" : "Internship";

  return (
    <TableRow className="group">
      <TableCell className="font-medium text-gray-900">{title}</TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-50">
          Draft
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium">{typeLabel}</span>
      </TableCell>
      <TableCell className="text-sm text-gray-500">
        {format(new Date(draft.updatedAt), "MMM dd, yyyy")}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-50">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                router.push(`/employer-dashboard/jobs/create?draftId=${draft._id}&type=${draft.type}`);
              }}
              className="cursor-pointer"
            >
              <Edit className="mr-2 size-4" /> Edit Draft
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              disabled={isDeleting}
              onClick={() => deleteDraft(draft._id)}
            >
              <Trash2 className="mr-2 size-4" />{" "}
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
