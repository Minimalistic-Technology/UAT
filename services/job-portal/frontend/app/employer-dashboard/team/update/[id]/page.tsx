"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetEmployeeById,
  useUpdateEmployee,
} from "@/features/employer/hooks/use-company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  updateTeamMemberSchema,
  UpdateTeamMemberSchema,
} from "@/features/employer/validations/team.schema";

export default function UpdateTeamMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const { data: memberData, isLoading, isError } = useGetEmployeeById(memberId);
  const updateEmployeeMutation = useUpdateEmployee();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateTeamMemberSchema>({
    resolver: zodResolver(updateTeamMemberSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      isActive: true,
    },
  });

  const isActiveWatch = watch("isActive");

  useEffect(() => {
    if (memberData?.data?.member) {
      const member = memberData.data.member;
      setValue("firstName", member.user.firstName);
      setValue("lastName", member.user.lastName);
      setValue("isActive", member.isActive);
    }
  }, [memberData, setValue]);

  const onSubmit = (data: UpdateTeamMemberSchema) => {
    updateEmployeeMutation.mutate({ id: memberId, data });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !memberData?.data?.member) {
    return (
      <div className="text-destructive p-20 text-center">
        Failed to load member details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/employer-dashboard/team")}
          className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Update Team Member
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Modify the details and status of this team member.
          </p>
        </div>
      </div>

      <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] shadow-sm dark:bg-slate-900">
        <CardHeader className="px-7 pt-6 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Member Details
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Update the employee's name and activity status.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-7 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-destructive text-sm">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-destructive text-sm">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={memberData.data.member.user.email}
                disabled
                className="bg-muted/50"
              />
              <p className="text-muted-foreground text-xs">
                Email addresses cannot be changed.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-muted-foreground text-sm">
                  If disabled, this member will no longer have access to the
                  company dashboard.
                </p>
              </div>
              <Switch
                checked={isActiveWatch}
                onCheckedChange={(val) => setValue("isActive", val)}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/employer-dashboard/team")}
                disabled={updateEmployeeMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateEmployeeMutation.isPending}>
                {updateEmployeeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
