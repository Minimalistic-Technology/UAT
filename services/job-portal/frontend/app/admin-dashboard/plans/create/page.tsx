"use client";

import Link from "next/link";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ArrowLeft, Loader2, Asterisk } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  CreatePlanFormValues,
  createPlanSchema,
} from "@/features/admin/validations/plan.schema";
import { useCreatePlan } from "@/features/admin/hooks/use-plan";

export default function CreatePlanForm() {
  const { mutate: createPlan, isPending } = useCreatePlan();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePlanFormValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: "",
      price: 0,
      currency: "INR",
      durationDays: 30,
      postValidityDays: 30,
      jobPostLimit: -1,
      teamMemberLimit: -1,
      features: [""],
      isFeatured: false,
      isDefault: false,
      displayOrder: 0,
      isActive: true,
      allowResumeDownload: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    //@ts-ignore
    name: "features",
  });

  const onSubmit = (data: CreatePlanFormValues) => {
    createPlan(data);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Plan</h1>
        <p className="text-muted-foreground mt-2">
          Add a new subscription plan for employers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Plan Configuration</CardTitle>
          <CardDescription>
            Configure pricing, limits, and visibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g. Premium Plan"
                />
                {errors.name && (
                  <p className="text-destructive text-xs">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min={0}
                  {...register("displayOrder", { valueAsNumber: true })}
                />
                {errors.displayOrder && (
                  <p className="text-destructive text-xs">
                    {errors.displayOrder.message}
                  </p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 gap-6 border-t pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="1"
                  min={0}
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-destructive text-xs">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  onValueChange={(val) =>
                    setValue("currency", val as "INR" | "USD" | "EUR" | "GBP")
                  }
                  defaultValue={watch("currency")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                    <SelectItem value="GBP">GBP — British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Durations */}
            <div className="grid grid-cols-1 gap-6 border-t pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Plan Expiry Period (In Days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  {...register("durationDays", { valueAsNumber: true })}
                />
                {errors.durationDays && (
                  <p className="text-destructive text-xs">
                    {errors.durationDays.message}
                  </p>
                )}
              </div>

              {/* New Input Field: postValidityDays */}
              <div className="space-y-2">
                <Label htmlFor="postValidityDays" className="flex items-center gap-1">
                  Job Post Visibility (In Days) <Asterisk className="text-destructive size-3" />
                </Label>
                <Input
                  id="postValidityDays"
                  type="number"
                  min={1}
                  {...register("postValidityDays", { valueAsNumber: true })}
                />
                {errors.postValidityDays && (
                  <p className="text-destructive text-xs">
                    {errors.postValidityDays.message}
                  </p>
                )}
              </div>
            </div>

            {/* Platform Resource Limits */}
            <div className="grid grid-cols-1 gap-6 border-t pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jobLimit">
                  Job Post Limit (-1 = Unlimited)
                </Label>
                <Input
                  id="jobLimit"
                  type="number"
                  min={-1}
                  {...register("jobPostLimit", { valueAsNumber: true })}
                />
                {errors.jobPostLimit && (
                  <p className="text-destructive text-xs">
                    {errors.jobPostLimit.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamMemberLimit">
                  Team Member Limit (-1 = Unlimited)
                </Label>
                <Input
                  id="teamMemberLimit"
                  type="number"
                  min={-1}
                  {...register("teamMemberLimit", { valueAsNumber: true })}
                />
                {errors.teamMemberLimit && (
                  <p className="text-destructive text-xs">
                    {errors.teamMemberLimit.message}
                  </p>
                )}
              </div>
            </div>

            {/* Visibility Options & Toggles */}
            <div className="bg-muted/30 grid grid-cols-1 gap-4 rounded-lg border-y px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={watch("isActive")}
                  onCheckedChange={(val) => setValue("isActive", val)}
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active Plan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={watch("isFeatured")}
                  onCheckedChange={(val) => setValue("isFeatured", val)}
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">Featured Plan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={watch("isDefault")}
                  onCheckedChange={(val) => setValue("isDefault", val)}
                />
                <Label htmlFor="isDefault" className="cursor-pointer">Default Plan</Label>
              </div>

              {/* New Toggle Field: allowResumeDownload */}
              <div className="flex items-center space-x-2 border-t pt-2 sm:border-t-0 sm:pt-0">
                <Controller
                  name="allowResumeDownload"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="allowResumeDownload"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="allowResumeDownload" className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-400">
                  Allow Resume Downloads
                </Label>
              </div>
            </div>

            {/* Features Array */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold">Plan Features</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append("" as any)}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Feature
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-1">
                    <div className="flex gap-2">
                      <Input
                        {...register(`features.${index}` as const)}
                        placeholder={`Feature ${index + 1}`}
                        className={
                          errors.features?.[index] ? "border-destructive" : ""
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.features?.[index] && (
                      <p className="text-destructive ml-1 text-[10px] font-medium">
                        {errors.features[index]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full min-w-37.5 cursor-pointer bg-indigo-700 sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create Plan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}