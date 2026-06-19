"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schema/auth-schema";
import { LoginValues } from "../types/auth-type";
import { useLogin } from "../hooks/use-login";
import Link from "next/link";
import { isAxiosError } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "../context/auth-context";
import { Mail, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { LoginResponse } from "../types/auth-response";

const LoginForm = () => {
  const { refreshUser } = useAuth();

  const { mutate: loginMutate, isPending: isLoginPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginValues) => {
    loginMutate(data, {
      onSuccess: (res: LoginResponse) => {
        const userRole = res?.data?.user?.role?.toLowerCase();
        toast.success("Login successful! Welcome back.");
        setTimeout(() => {
          if (userRole === "admin") {
            window.location.href = "/dashboard";
          } else {
            window.location.href = "/my-blogs";
          }
        }, 600);
      },
      onError: (err) => {
        toast.error(isAxiosError(err) ? err.response?.data?.message : "Login failed");
      }
    });
  };

  return (
    <Card className="w-full mx-auto animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-[28px] font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your email to sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
          <div className="relative">
            <Input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="text-xs font-semibold text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#1877F2] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              {...register("password")}
              type="password"
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-xs font-semibold text-red-500 mt-1">{errors.password.message}</p>}
        </div>
        <Button
          type="submit"
          disabled={isLoginPending}
          fullWidth
          className="py-3.5 bg-[#111] dark:bg-white hover:bg-black text-white dark:text-gray-900 hover:text-white border-0 shadow-sm"
        >
          {isLoginPending ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Mail size={16} />
              Sign In with Email
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center animate-in duration-200">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-gray-900 dark:text-white font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default LoginForm;
