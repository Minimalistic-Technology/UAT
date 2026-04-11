"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Eye, EyeOff, RefreshCw } from "lucide-react";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "../lib/auth-validator";
import { useRegister } from "../hooks/use-register";

const RegisterClient = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate, isPending } = useRegister();

  const onSubmit = (data: RegisterInput) => {
    mutate(data);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 transition-colors duration-300">
      <Card className="w-full max-w-sm border-border/50 bg-card/50 backdrop-blur-sm shadow-xl dark:shadow-2xl dark:shadow-primary/5">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
            Create an account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your details below to get started
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            {/* Email Field */}
            <div className="grid gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={`pl-10 bg-background/40 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 ${
                    errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="grid gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`pl-10 pr-10 bg-background/40 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 ${
                    errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button
              id="register-submit"
              type="submit"
              disabled={isPending}
              className="w-full font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:scale-100"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending code…
                </span>
              ) : (
                "Create Account"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterClient;