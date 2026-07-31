"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateEmployee } from "@/features/employer/hooks/use-company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  createTeamMemberSchema,
  type CreateTeamMemberSchema,
} from "@/features/employer/validations/team.schema";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTeamMemberDialog({
  open,
  onOpenChange,
}: AddTeamMemberDialogProps) {
  const createEmployeeMutation = useCreateEmployee();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
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

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset();
      setShowPassword(false);
    }
  }, [open, reset]);

  const onSubmit = (data: CreateTeamMemberSchema) => {
    createEmployeeMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 sm:max-w-xl sm:p-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold">
            Add Team Member
          </DialogTitle>
          <DialogDescription className="mt-2 text-base">
            Enter the details of the employee you want to add to your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2.5">
              <Label htmlFor="firstName" className="text-sm font-semibold">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                className="h-11"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-destructive text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="lastName" className="text-sm font-semibold">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                className="h-11"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-destructive text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              className="h-11"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="password" className="text-sm font-semibold">
              Temporary Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="******"
                {...register("password")}
                className="h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-0 right-0 h-11 w-11 hover:bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="text-muted-foreground h-4 w-4" />
                ) : (
                  <Eye className="text-muted-foreground h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          <DialogFooter className="ext-right mt-2 gap-3 border-t border-slate-100 pt-6 sm:justify-end dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full min-w-[120px] sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={createEmployeeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 w-full min-w-[140px] sm:w-auto"
              disabled={createEmployeeMutation.isPending}
            >
              {createEmployeeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
