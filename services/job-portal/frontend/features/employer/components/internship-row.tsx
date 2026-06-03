"use client";
import { MoreHorizontal, Edit, Trash2, Eye, FileUser } from "lucide-react";
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
import { useDeleteMyInternshipPosting } from "../hooks/use-internship";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "draft":
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    case "expired":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    default:
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  }
};

export function InternshipRow({ internship }: { internship: any }) {
  const router = useRouter();
  const { mutate: deleteInternship, isPending: isDeleting } = useDeleteMyInternshipPosting();

  return (
    <TableRow className="group">
      <TableCell className="font-medium text-gray-900">{internship.title}</TableCell>
      <TableCell>
        <Badge variant="secondary" className={getStatusColor(internship.status)}>
          {internship.status}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium">
          {internship.applicationsCount || 0}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium">{internship.postedBy.firstName + " " + internship.postedBy.lastName}</span>
      </TableCell>
      <TableCell className="text-sm text-gray-500">
        {format(new Date(internship.createdAt), "MMM dd, yyyy")}
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
            <DropdownMenuItem>
              <button
                type="button"
                onClick={() =>
                  router.push(`/employer-dashboard/internships/${internship._id}`)
                }
                className="flex cursor-pointer items-center"
              >
                <Eye className="mr-2 size-4" /> View Details
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/employer-dashboard/internships/${internship._id}/applications`)
              }
            >
              <FileUser className="mr-2 size-4" />
              <span>View Applications</span>
              {internship.applicationsCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-auto px-1.5 py-0 text-[10px]"
                >
                  {internship.applicationsCount}
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={internship.status === "closed"}
              onClick={() => {
                router.push(`/employer-dashboard/internships/${internship._id}/edit`)
              }}
            >
              <Edit className="mr-2 size-4" /> Edit Internship
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              disabled={isDeleting}
              onClick={() => deleteInternship(internship._id)}
            >
              <Trash2 className="mr-2 size-4 hover:stroke-red-200" />{" "}
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
