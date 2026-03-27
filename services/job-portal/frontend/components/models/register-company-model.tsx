"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/cn";

interface RegisterCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const registerCompanySchema = z.object({
  firstName: z.string().min(1, "Owner first name is required"),
  lastName: z.string().min(1, "Owner last name is required"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  companyDescription: z.string().min(1, "Company description is required"),
});

type RegisterCompanyFormData = z.infer<typeof registerCompanySchema>;

const RegisterCompanyModel = ({
  isOpen,
  onClose,
  onSuccess,
}: RegisterCompanyModalProps) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterCompanyFormData>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      phone: "",
      companyName: "",
      companyDescription: "",
      industry: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: RegisterCompanyFormData) => {
    setLoading(true);
    try {
      await apiClient.post("/companies", data);
      toast.success("Company registered successfully");
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to register company"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/90 backdrop-blur px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Register New Company
            </h2>
            <p className="text-sm text-gray-500">
              Fill in the details below to onboard a new company.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto px-6 py-6 space-y-8 max-h-[calc(90vh-80px)]"
        >
          {/* Owner Section */}
          <div className="space-y-5">
            <div className="border-b pb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Owner Information
              </h3>
              <p className="text-xs text-gray-500">
                Personal details of the company owner.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <Input
                label="Last Name"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              {...register("phone")}
              error={errors.phone?.message}
            />
          </div>

          {/* Company Section */}
          <div className="space-y-5">
            <div className="border-b pb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Company Information
              </h3>
              <p className="text-xs text-gray-500">
                Basic information about the company.
              </p>
            </div>

            <Input
              label="Company Name"
              {...register("companyName")}
              error={errors.companyName?.message}
            />

            <Input
              label="Industry"
              {...register("industry")}
              error={errors.industry?.message}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-800">
                Company Description
              </label>

              <textarea
                {...register("companyDescription")}
                rows={4}
                className={cn(
                  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md resize-none",
                  errors.companyDescription
                    ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
              />

              {errors.companyDescription && (
                <p className="text-sm text-red-600">
                  {errors.companyDescription.message}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" loading={loading} disabled={loading} className="cursor-pointer">
              Register Company
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterCompanyModel;