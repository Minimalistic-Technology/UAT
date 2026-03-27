"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

const addEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AddEmployeeFormData = z.infer<typeof addEmployeeSchema>;

const AddEmployeePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddEmployeeFormData>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AddEmployeeFormData) => {
    setLoading(true);
    try {
      await apiClient.post("/company-members", data);
      toast.success("Employee added successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      router.push("/employer/team"); // Assuming this is the team listing page
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/employer/team"
            className="mb-2 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Team
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-blue-600" />
            Add New Employee
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Invite a new team member to help manage your platform.
          </p>
        </div>
      </div>

      {/* Main form card */}
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border bg-white shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Personal Information
              </h2>
              <p className="text-sm text-gray-500">
                Enter the employee's basic details and login credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="First Name"
                placeholder="e.g. Jane"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <Input
                label="Last Name"
                placeholder="e.g. Doe"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>

            <div className="space-y-6 pt-2">
              <Input
                label="Email Address"
                type="email"
                placeholder="jane.doe@company.com"
                {...register("email")}
                error={errors.email?.message}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                error={errors.password?.message}
              />
            </div>

            <div className="pt-6 border-t flex items-center gap-4 justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/employer/team")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                Add Employee
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-blue-50/50 p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              What happens next?
            </h3>
            <ul className="space-y-3 text-sm text-blue-800">
              <li className="flex gap-2">
                <span className="shrink-0 text-blue-500">•</span>
                <span>The employee account will be created immediately.</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-blue-500">•</span>
                <span>
                  They can log in using the email and password you set here.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-blue-500">•</span>
                <span>
                  You can manage their access later from the Team Dashboard.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeePage;
