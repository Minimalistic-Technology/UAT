import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileFormValues } from "@/validations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const ExperienceTab = () => {
  const { control, register, watch, formState: { errors } } = useFormContext<ProfileFormValues>();

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experience",
  });

  const experienceValues = watch("experience");

  return (
    <TabsContent value="experience" className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Work Experience</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendExp({ title: "", company: "", workType: "wfo", location: "", startDate: "", endDate: "", current: false, description: "" } as any)}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Experience
        </Button>
      </div>
      <div className="space-y-6">
        {expFields.map((field, index) => {
          const isCurrent = experienceValues?.[index]?.current;
          return (
            <div key={field.id} className="p-4 border rounded-md relative space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-red-500"
                onClick={() => removeExp(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input {...register(`experience.${index}.title`)} />
                  {errors.experience?.[index]?.title && (
                    <p className="text-red-500 text-sm">{errors.experience[index]?.title?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input {...register(`experience.${index}.company`)} />
                  {errors.experience?.[index]?.company && (
                    <p className="text-red-500 text-sm">{errors.experience[index]?.company?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Work Type</Label>
                  <Controller
                    control={control}
                    name={`experience.${index}.workType`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wfo">WFO</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="temporary_wfh">Temporary WFH</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.experience?.[index]?.workType && (
                    <p className="text-red-500 text-sm">{errors.experience[index]?.workType?.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Location {experienceValues?.[index]?.workType !== "remote" && <span className="text-red-500">*</span>}
                  </Label>
                  <Input {...register(`experience.${index}.location`)} />
                  {errors.experience?.[index]?.location && (
                    <p className="text-red-500 text-sm">{errors.experience[index]?.location?.message as string}</p>
                  )}
                </div>

                {/* Start & End Date side by side */}
                <div className="space-y-2 flex flex-col">
                  <Label>Start Date</Label>
                  <Controller
                    control={control}
                    name={`experience.${index}.startDate`}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value), "dd/MM/yyyy") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.experience?.[index]?.startDate && (
                    <p className="text-red-500 text-sm">{errors.experience[index]?.startDate?.message as string}</p>
                  )}
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label>End Date</Label>
                  <Controller
                    control={control}
                    name={`experience.${index}.endDate`}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            disabled={isCurrent}
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value), "dd/MM/yyyy") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>

                {/* Checkbox full width below dates */}
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`current-${index}`}
                    {...register(`experience.${index}.current`)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={`current-${index}`} className="font-normal cursor-pointer">
                    I currently work here
                  </Label>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Description</Label>
                  <Textarea {...register(`experience.${index}.description`)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </TabsContent>
  );
};