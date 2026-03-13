"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { employerRegisterSchema, EmployerRegisterInput } from "../employer.schema";
import { useEmployerRegister } from "../hooks/use-employer-register";
import { useRouter } from "next/navigation";

type EmployerRegisterFormValues = Omit<EmployerRegisterInput, "role">;

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Consulting",
  "Marketing",
  "Real Estate",
  "Other",
];

export default function EmployerRegisterPage() {
  const registerMutation = useEmployerRegister();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmployerRegisterFormValues>({
    resolver: zodResolver(employerRegisterSchema),
  });

  const onSubmit = async (data: EmployerRegisterFormValues) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords don't match",
      });
      return;
    }

    registerMutation.mutate(data as EmployerRegisterInput);
    router.replace("/login");
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900">
            Create Employer Account
          </h2>
          <p className="mt-2 text-gray-600">
            Hire top talent and grow your company
          </p>
        </div>

        <Card className="p-8 shadow-lg">

          <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-6">

            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register("firstName")}
                  label="First Name"
                  placeholder="John"
                  error={errors.firstName?.message as string}
                  disabled={isLoading}
                />

                <Input
                  {...register("lastName")}
                  label="Last Name"
                  placeholder="Doe"
                  error={errors.lastName?.message as string}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Company Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Company Information
              </h3>

              <Input
                {...register("companyName")}
                label="Company Name"
                placeholder="Acme Corp"
                error={errors.companyName?.message as string}
                disabled={isLoading}
              />

              {/* Industry */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>

                <select
                  {...register("industry")}
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>

                {errors.industry && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.industry.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <Input
              {...register("email")}
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              error={errors.email?.message as string}
              disabled={isLoading}
            />

            <Input
              {...register("phone")}
              type="tel"
              label="Phone Number (Optional)"
              placeholder="+91 9876543210"
              error={errors.phone?.message as string}
              disabled={isLoading}
            />

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register("password")}
                type="password"
                label="Password"
                placeholder="••••••••"
                error={errors.password?.message as string}
                disabled={isLoading}
              />

              <Input
                {...register("confirmPassword")}
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message as string}
                disabled={isLoading}
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 text-sm">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-gray-700">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary-600 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}