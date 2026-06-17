"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, Asterisk } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  CreatePlanFormValues,
  createPlanSchema,
} from "@/features/admin/validations/plan.schema";
import { useUpdatePlan } from "@/features/admin/hooks/use-plan";
import { Plan } from "@/types/new-index";

interface PlanEditDialogProps {
  plan: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanEditDialog({
  plan,
  open,
  onOpenChange,
}: PlanEditDialogProps) {
  const { mutate: updatePlan, isPending } = useUpdatePlan();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePlanFormValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: "",
      price: 0,
      currency: "INR",
      durationDays: 30,
      jobPostLimit: -1,
      teamMemberLimit: -1,
      features: [""],
      isFeatured: false,
      isDefault: false,
      displayOrder: 0,
      isActive: true,
      allowResumeDownload: false,
      postValidityDays: 30,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    //@ts-ignore
    name: "features",
  });

  useEffect(() => {
    if (plan && open) {
      reset({
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        durationDays: plan.durationDays,
        jobPostLimit: plan.jobPostLimit,
        teamMemberLimit:
          plan.teamMemberLimit !== undefined ? plan.teamMemberLimit : -1,
        features: plan.features?.length ? plan.features : [""],
        isFeatured: plan.isFeatured,
        isDefault: plan.isDefault,
        displayOrder: plan.displayOrder,
        isActive: plan.isActive,
        allowResumeDownload: plan.allowResumeDownload || false,
        postValidityDays: plan.postValidityDays || 30,
      });
    }
  }, [plan, open, reset]);

  const onSubmit = (data: CreatePlanFormValues) => {
    if (!plan?._id) return;
    const cleanedFeatures = data.features.filter(
      (f) => f && f.trim().length > 0,
    );
    updatePlan(
      { id: plan._id, data: { ...data, features: cleanedFeatures } },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden border-0 bg-white p-0 shadow-2xl sm:rounded-[24px] dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-100 px-8 py-5 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold">Edit Plan</DialogTitle>
          <DialogDescription className="text-slate-500">
            Update pricing, limits, and features for this plan.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
          <form
            id="plan-edit-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Plan Name</Label>
                <Input
                  id="edit-name"
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
                <Label htmlFor="edit-displayOrder">Display Order</Label>
                <Input
                  id="edit-displayOrder"
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
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
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
                  value={watch("currency")}
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
                <Label htmlFor="edit-duration">
                  Plan Expiry Period (In Days)
                </Label>
                <Input
                  id="edit-duration"
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
                <Label
                  htmlFor="edit-postValidityDays"
                  className="flex items-center gap-1"
                >
                  Job Post Visibility (In Days){" "}
                  <Asterisk className="text-destructive size-3" />
                </Label>
                <Input
                  id="edit-postValidityDays"
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

            {/* Limits */}
            <div className="grid grid-cols-1 gap-6 border-t pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-jobLimit">
                  Job Post Limit (-1 = Unlimited)
                </Label>
                <Input
                  id="edit-jobLimit"
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
                <Label htmlFor="edit-teamMemberLimit">
                  Team Member Limit (-1 = Unlimited)
                </Label>
                <Input
                  id="edit-teamMemberLimit"
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

            {/* Toggles */}
            <div className="bg-muted/30 grid grid-cols-1 gap-4 rounded-lg border px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={watch("isActive")}
                  onCheckedChange={(val) => setValue("isActive", val)}
                />
                <Label htmlFor="edit-isActive" className="cursor-pointer">
                  Active Plan
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isFeatured"
                  checked={watch("isFeatured")}
                  onCheckedChange={(val) => setValue("isFeatured", val)}
                />
                <Label htmlFor="edit-isFeatured" className="cursor-pointer">
                  Featured Plan
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isDefault"
                  checked={watch("isDefault")}
                  onCheckedChange={(val) => setValue("isDefault", val)}
                />
                <Label htmlFor="edit-isDefault" className="cursor-pointer">
                  Default Plan
                </Label>
              </div>

              {/* New Toggle Field: allowResumeDownload */}
              <div className="flex items-center space-x-2 border-t pt-2 sm:border-t-0 sm:pt-0">
                <Controller
                  name="allowResumeDownload"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="edit-allowResumeDownload"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="edit-allowResumeDownload"
                  className="cursor-pointer font-semibold text-indigo-700 dark:text-indigo-400"
                >
                  Allow Resume Downloads
                </Label>
              </div>
            </div>

            {/* Features Array */}
            <div className="space-y-4 border-t pt-4">
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
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.features?.[index] && (
                      <p className="text-destructive ml-1 text-xs font-medium">
                        {errors.features[index]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </ScrollArea>
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-8 py-5 dark:border-slate-800 dark:bg-slate-800/50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="plan-edit-form"
            disabled={isPending}
            className="rounded-xl bg-[#2563eb] px-6 font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
