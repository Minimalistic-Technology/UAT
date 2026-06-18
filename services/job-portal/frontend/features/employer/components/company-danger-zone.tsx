import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useDeleteCompany } from "../hooks/use-company";
import { useGetUserDetails } from "@/hooks/use-user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CompanyDangerZoneProps {
  company: any;
}

export const CompanyDangerZone = ({ company }: CompanyDangerZoneProps) => {
  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();
  const { data: userDetailsResponse } = useGetUserDetails();

  const user = userDetailsResponse?.data;

  if (!company) return null;

  const isOwner = user && company.owner?._id === user._id;

  if (!isOwner) {
    return null;
  }

  return (
    <div className="h-full space-y-6 rounded-[20px] border-0 bg-red-50 p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:bg-red-950/20">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-red-700">
        <AlertTriangle className="h-5 w-5" />
        Danger Zone
      </h3>
      <p className="text-sm text-red-600/80">
        Permanently delete your company profile and all associated data. This
        action cannot be undone.
      </p>

      <div className="pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full cursor-pointer">
              Delete Company
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                company account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
                onClick={() => deleteCompany(company._id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Yes, Delete My Company
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
