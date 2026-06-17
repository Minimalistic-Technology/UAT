"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGetInternshipDetailsById } from "@/features/user/hooks/use-internship";
import { useApplyJob } from "@/features/user/hooks/use-job-application";
import {
  BriefcaseIcon,
  MapPinIcon,
  WalletIcon,
  CalendarIcon,
  Building2Icon,
  UsersIcon,
  MonitorIcon,
  GraduationCapIcon,
  ClockIcon,
  AwardIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyCard } from "@/components/company-card";
import { FormattedDescription } from "@/features/employer/components/formatted-description";
import { ListingType } from "@/types/enums";
import { getCurrencySymbol } from "@/utils";
import { format } from "date-fns";

const Page = () => {
  const params = useParams();
  const internshipId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: session } = useSession();

  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetInternshipDetailsById(String(internshipId));
  const internship = responseData?.data;

  const { mutate: applyJob, isPending: isApplying } = useApplyJob();

  const handleApply = () => {
    applyJob({
      listingId: internshipId as string,
      listingType: "internship" as ListingType,
    });
  };

  if (isLoading) return <InternshipSkeleton />;

  if (isError || !internship)
    return (
      <div className="p-10 text-center text-red-500">
        Error loading internship details.
      </div>
    );

  const canApply =
    session?.user?.role === "user" && session?.user?.isEmployee === false;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left Column: Main Details */}
        <div className="contents lg:col-span-2 lg:block lg:space-y-6">
          <Card className="order-1 border-none shadow-sm lg:order-0">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-primary text-3xl font-bold">
                    {internship.title}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1 flex items-center text-lg">
                    <Building2Icon className="mr-2 h-4 w-4" />
                    {internship.company.name}
                  </p>
                </div>
                {internship.isFeatured && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-700"
                  >
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="text-muted-foreground flex items-center text-sm capitalize">
                  <MapPinIcon className="mr-1 h-4 w-4 shrink-0" />
                  <span>
                    {internship.workMode === "remote"
                      ? "Remote"
                      : internship.location?.city &&
                        internship.location?.country}
                  </span>
                </div>

                {internship.workMode && internship.workMode !== "remote" && (
                  <div className="text-muted-foreground flex items-center text-sm capitalize">
                    <MonitorIcon className="mr-1 h-4 w-4" />
                    {internship.workMode.replace(/_/g, " ")}
                  </div>
                )}

                {internship.stipend && (
                  <div className="text-muted-foreground flex items-center text-sm capitalize">
                    <WalletIcon className="mr-1 h-4 w-4" />
                    {internship.stipend.type === "unpaid"
                      ? "Unpaid"
                      : `${getCurrencySymbol(internship.stipend.currency || "INR")} ${internship.stipend.amount?.toLocaleString() || "Variable"}/${internship.stipend.period}`}
                  </div>
                )}

                <div className="text-muted-foreground flex items-center text-sm capitalize">
                  <BriefcaseIcon className="mr-1 h-4 w-4" />
                  {internship.employmentType?.replace(/_/g, " ")}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="order-3 border-none shadow-sm lg:order-0">
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Description</h3>
                <FormattedDescription text={internship.description} />
              </div>

              {internship.requirements &&
                internship.requirements.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-3 text-lg font-semibold">
                        Requirements
                      </h3>
                      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
                        {internship.requirements.map(
                          (req: string, index: number) => (
                            <li key={index}>{req}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  </>
                )}

              {internship.skills && internship.skills.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">
                      Skills Required
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {internship.skills.map((skill: string) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="px-3 py-1"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {internship.benefits && internship.benefits.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Benefits</h3>
                    <ul className="text-muted-foreground list-disc space-y-2 pl-5">
                      {internship.benefits.map(
                        (benefit: string, index: number) => (
                          <li key={index}>{benefit}</li>
                        ),
                      )}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar Actions */}
        <div className="contents lg:block lg:space-y-6">
          <Card className="order-2 border-none shadow-sm lg:order-0">
            <CardHeader>
              <CardTitle className="text-xl">Internship Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" /> Posted On
                </span>
                <span className="text-right font-medium">
                  {format(new Date(internship.createdAt), "dd/MM/yyyy")}
                </span>
              </div>

              {internship.applicationDeadline && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <ClockIcon className="mr-2 h-4 w-4" /> Deadline
                  </span>
                  <span className="text-right font-medium">
                    {format(
                      new Date(internship.applicationDeadline),
                      "dd/MM/yyyy",
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <UsersIcon className="mr-2 h-4 w-4" /> Openings
                </span>
                <span className="text-right font-medium">
                  {internship.openings}
                </span>
              </div>

              {internship.duration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <ClockIcon className="mr-2 h-4 w-4" /> Duration
                  </span>
                  <span className="text-right font-medium capitalize">
                    {internship.duration.value} {internship.duration.unit}
                  </span>
                </div>
              )}

              {internship.isPPO !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <AwardIcon className="mr-2 h-4 w-4" /> PPO Offered
                  </span>
                  <span className="text-right font-medium capitalize">
                    {internship.isPPO ? "Yes" : "No"}
                  </span>
                </div>
              )}

              {internship.industry && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Building2Icon className="mr-2 h-4 w-4" /> Industry
                  </span>
                  <span className="text-right font-medium capitalize">
                    {internship.industry?.replace(/_/g, " ")}
                  </span>
                </div>
              )}

              {internship.roleCategory && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <BriefcaseIcon className="mr-2 h-4 w-4" /> Role
                  </span>
                  <span className="text-right font-medium capitalize">
                    {internship.roleCategory?.replace(/_/g, " ")}
                  </span>
                </div>
              )}

              {internship.education && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <GraduationCapIcon className="mr-2 h-4 w-4" /> Education
                  </span>
                  <span className="text-right font-medium capitalize">
                    {internship.education.minimumDegree?.replace(/_/g, " ")}
                    {internship.education.isRequired ? " (Req)" : ""}
                  </span>
                </div>
              )}

              <Separator className="my-4" />

              {canApply ? (
                <Button
                  className="h-12 w-full cursor-pointer text-lg font-semibold"
                  disabled={isApplying}
                  onClick={handleApply}
                >
                  {isApplying ? "Applying..." : "Apply Now"}
                </Button>
              ) : !session ? (
                <Button
                  variant="outline"
                  className="h-12 w-full cursor-pointer border-[#2563eb] text-[13px] font-semibold whitespace-nowrap text-[#2563eb] hover:bg-[#2563eb]/5 sm:text-sm"
                  onClick={() => (window.location.href = "/login")}
                >
                  Please login to apply for this internship.
                </Button>
              ) : (
                <div className="bg-muted text-destructive rounded-md p-3 text-center text-sm font-medium">
                  You are not eligible to apply for this role.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="order-4 lg:order-0">
            <CompanyCard
              company={{
                ...internship.company,
                location: internship.company.location,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Skeleton Loader
const InternshipSkeleton = () => (
  <div className="container mx-auto max-w-5xl space-y-6 px-4 py-10">
    <Skeleton className="h-40 w-full" />
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Skeleton className="h-96 lg:col-span-2" />
      <Skeleton className="h-64" />
    </div>
  </div>
);

export default Page;
