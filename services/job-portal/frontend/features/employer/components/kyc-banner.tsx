import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Users } from "lucide-react";

export function KycBanner({
  isVerified,
  setIsKycOpen,
}: {
  isVerified?: boolean;
  setIsKycOpen: () => void;
}) {
  if (isVerified) return null;

  return (
    <>
    <Card className="border-amber-200 bg-amber-50 p-5 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100">
          <Users className="h-5 w-5 text-amber-700" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-amber-900">
            Complete your company verification
          </h3>
          <p className="text-sm text-amber-700 mt-0.5">
            Verify your company to unlock job posting visibility and build trust
            with candidates.
          </p>
        </div>
      </div>

      <Button
        onClick={setIsKycOpen}
        className="bg-amber-600 hover:bg-amber-700 text-white"
      >
        Complete KYC
      </Button>
    </Card>
    {}
    </>
  );
}
