import React from "react";
import Link from "next/link";
import { ArrowUpRight, Eye, Briefcase } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApplicationStatusColor } from "@/utils";

interface RecentApplicationsCardProps {
  applications: any[];
}

export function RecentApplicationsCard({
  applications,
}: RecentApplicationsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>
            Status updates for your latest submissions
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-primary hover:text-primary hover:bg-primary/5"
        >
          <Link href="/user-dashboard/applications">
            View All <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!applications || applications.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed py-12 text-center">
              <Briefcase className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-slate-500">
                You haven't applied to any jobs yet.
              </p>
              <Button variant="link" asChild>
                <Link href="/find-jobs">Start searching</Link>
              </Button>
            </div>
          ) : (
            applications.slice(0, 4).map((app: any) => (
              <div
                key={app._id}
                className="group bg-card hover:border-primary/30 flex items-center justify-between rounded-xl border p-4 transition-all"
              >
                <div className="flex flex-col gap-1">
                  <h4 className="group-hover:text-primary font-semibold text-slate-900 transition-colors">
                    {app.listing?.title || "Unknown Job Title"}
                  </h4>
                  <div className="text-muted-foreground flex items-center gap-3 text-sm">
                    <span>
                      {app.listing?.company?.name || "Unknown Company"}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={`border-none px-3 py-1 font-medium capitalize ${getApplicationStatusColor(app.status)}`}
                  >
                    {(app.status || "Unknown").toLowerCase().replace("_", " ")}
                  </Badge>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    asChild
                  >
                    <Link href={`/user-dashboard/applications/${app._id}`}>
                      <Eye className="h-4 w-4 text-slate-500" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
