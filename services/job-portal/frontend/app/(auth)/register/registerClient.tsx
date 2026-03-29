"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
import { toast } from "sonner";
import { registerUserSchema, RegisterUserInput } from "@/features/auth/auth.schema";
import { useRegister } from "@/features/auth/hooks/use-register";

type RegisterFormValues = Omit<RegisterUserInput, "role">;

export default function RegisterClient() {
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerUserSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords don't match",
      });
      return;
    }
    
    registerMutation.mutate(data as RegisterUserInput, {
      onSuccess: () => {
        alert("success")
        toast.success("OTP sent to your email!");
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      },
      onError: (error: any) => {
        alert("error")
        toast.error(error.response?.data?.message || "Registration failed");
      },
    });
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="max-h-[calc(100vh-64px)] h-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join our platform today</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-6">

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
              placeholder="+1234567890"
              error={errors.phone?.message as string}
              disabled={isLoading}
            />

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

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
