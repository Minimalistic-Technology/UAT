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
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm space-y-6 h-full">
      <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Danger Zone
      </h3>
      <p className="text-sm text-red-600/80">
        Permanently delete your company profile and all associated data. This action cannot be undone.
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
                This action cannot be undone. This will permanently delete your company
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                onClick={() => deleteCompany(company._id)}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Yes, Delete My Company
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
