import { useFormContext, Controller } from "react-hook-form";
import { CreateJobFormData } from "@/features/employer/validations/job.schema";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function JobPublishing({ initialData }: { initialData?: any }) {
  const {
    setValue,
    control,
    formState: { errors },
  } = useFormContext<CreateJobFormData>();

  return (
    <section className="space-y-6 pb-2">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Publishing & Perks</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Dates, visibility settings, and added benefits.
        </p>
      </div>
      <div className="space-y-6">
        <div className="grid gap-2">
          <Label>Benefits (one per line)</Label>
          <Textarea
            placeholder="Health Insurance..."
            defaultValue={initialData?.benefits?.join("\n")}
            onChange={(e) =>
              setValue("benefits", e.target.value.split("\n").filter(Boolean))
            }
            className="min-h-37.5"
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Application Deadline</Label>
            <Controller
              name="applicationDeadline"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(new Date(field.value), "d/M/yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString() : undefined)
                      }
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.applicationDeadline && (
              <p className="text-destructive text-xs">
                {errors.applicationDeadline.message}
              </p>
            )}
          </div>

          {/* <div className="grid gap-2">
                        <Label>Visibility</Label>
                        <div className="flex items-center space-x-2 rounded-lg border p-4">
                            <Controller
                                name="isFeatured"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id="isFeatured" checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor="isFeatured" className="cursor-pointer font-normal">Feature this listing</Label>
                        </div>
                    </div> */}
        </div>
      </div>
    </section>
  );
}
