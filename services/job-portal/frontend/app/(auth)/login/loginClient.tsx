"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
import { toast } from "sonner";
import { Mail, Lock, Chrome } from "lucide-react";
import { loginSchema, LoginUserInput } from "@/features/auth/auth.schema";
import { useLogin } from "@/features/auth/hooks/use-login";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";
  const { data: session, status } = useSession();
  
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginUserInput) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Login successful!");
      },
      onError: (error: any) => {
        toast.error(error.message || "Login failed");
      }
    });
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      toast.error("Google login failed");
    }
  };

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const { role, isEmployee } = session.user as any;

    if (role === "super_admin") {
      router.push("/admin-dashboard");
    } else if (role === "user") {
      if (isEmployee) {
        router.push("/employer/dashboard");
      } else {
        router.push("/user-dashboard");
      }
    } else {
      router.push(callbackUrl);
    }

    router.refresh();
  }, [session, status, router, callbackUrl]);

  const isLoading = loginMutation.isPending || status === "loading";

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              {...register("email")}
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              error={errors.email?.message}
              disabled={isLoading}
            />

            <Input
              {...register("password")}
              type="password"
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
              disabled={isLoading}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              <Mail className="w-4 h-4 mr-2" />
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Google
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
