"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateEmployee } from "@/features/employer/hooks/use-company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTeamMemberSchema, type CreateTeamMemberSchema } from "@/features/employer/validations/team.schema";

export default function AddTeamMemberPage() {
  const router = useRouter();
  const createEmployeeMutation = useCreateEmployee();
  const [showPassword, setShowPassword] = useState(false);

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
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Team Member</h1>
          <p className="text-muted-foreground">
            Invite a new member to your company workspace
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Details</CardTitle>
          <CardDescription>
            Enter the details of the employee you want to add to your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
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