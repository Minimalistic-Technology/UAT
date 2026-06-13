"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateEmployee, useGetMyCompanyDetails } from "@/features/employer/hooks/use-company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createTeamMemberSchema, type CreateTeamMemberSchema } from "@/features/employer/validations/team.schema";
import { toast } from "sonner";

export default function AddTeamMemberPage() {
  const router = useRouter();
  const createEmployeeMutation = useCreateEmployee();
  const { data: companyRes, isLoading } = useGetMyCompanyDetails();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && companyRes) {
      const hasPlan = !!companyRes.data?.currentPlan;
      if (!hasPlan) {
        toast.error("Please purchase a subscription plan to add team members.");
        router.replace("/employer-dashboard/plans");
      }
    }
  }, [companyRes, isLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamMemberSchema>({
    resolver: zodResolver(createTeamMemberSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: CreateTeamMemberSchema) => {
    createEmployeeMutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Add Team Member</h1>
          <p className="text-slate-500 text-sm mt-1">
            Invite a new member to your company workspace
          </p>
        </div>
      </div>

      <Card className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-4 pt-6 px-7">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Member Details</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Enter the details of the employee you want to add to your team.
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
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
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
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="******"
                  {...register("password")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/employer-dashboard/team")}
                disabled={createEmployeeMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createEmployeeMutation.isPending}>
                {createEmployeeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Member
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}