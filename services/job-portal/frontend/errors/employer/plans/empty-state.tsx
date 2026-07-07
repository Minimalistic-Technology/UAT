import { Briefcase } from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="col-span-full rounded-[20px] border-dashed bg-slate-50/50 py-20 shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:bg-slate-900/50">
      <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-white p-4 shadow-sm dark:bg-slate-800">
          <Briefcase className="h-10 w-10 text-slate-400" />
        </div>
        <div className="space-y-2">
          <CardTitle>No plans available</CardTitle>
          <CardDescription>
            There are currently no active subscription plans. Check back later.
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}
