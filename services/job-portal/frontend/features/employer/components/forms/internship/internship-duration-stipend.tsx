import { useFormContext, Controller } from "react-hook-form";
import { CreateInternshipFormData } from "@/features/employer/validations/internship.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Asterisk } from "lucide-react";

export function InternshipDurationStipend() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<CreateInternshipFormData>();

  return (
    <section className="border-border/70 space-y-6 border-b pb-10">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Duration & Stipend</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Establish base compensation and time period details to attract
          applicants.
        </p>
      </div>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label className="flex items-center gap-1">
              Duration <Asterisk className="text-destructive size-3" />
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                placeholder="e.g. 3"
                {...register("duration.value", { valueAsNumber: true })}
                className="w-24"
              />
              <Controller
                name="duration.unit"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {errors.duration?.value && (
              <p className="text-destructive text-xs">
                {errors.duration.value.message}
              </p>
            )}
            {errors.duration?.unit && (
              <p className="text-destructive text-xs">
                {errors.duration.unit.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              {...register("startDate")}
            />
            {errors.startDate && (
              <p className="text-destructive text-xs">
                {errors.startDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="grid gap-2">
            <Label className="flex items-center gap-1">
              Stipend Type <Asterisk className="text-destructive size-3" />
            </Label>
            <Controller
              name="stipend.type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="performance_based">
                      Performance Based
                    </SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.stipend?.type && (
              <p className="text-destructive text-xs">
                {errors.stipend.type.message}
              </p>
            )}
          </div>

          {watch("stipend.type") !== "unpaid" && (
            <>
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  min={0}
                  {...register("stipend.amount", { valueAsNumber: true })}
                  placeholder="e.g. 15000"
                />
                {errors.stipend?.amount && (
                  <p className="text-destructive text-xs">
                    {errors.stipend.amount.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Currency</Label>
                <Controller
                  name="stipend.currency"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label>Stipend Period</Label>
                <Controller
                  name="stipend.period"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Controller
              name="isPPO"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isPPO"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="isPPO" className="cursor-pointer">
              Pre-Placement Offer (PPO) on completion
            </Label>
          </div>
        </div>
      </div>
    </section>
  );
}
