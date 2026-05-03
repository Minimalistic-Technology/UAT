import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileFormValues } from "@/validations";

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
        <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" })}>
          <Plus className="h-4 w-4 mr-2" /> Add Experience
        </Button>
      </div>
      <div className="space-y-6">
        {expFields.map((field, index) => {
          const isCurrent = experienceValues?.[index]?.current;
          return (
          <div key={field.id} className="p-4 border rounded-md relative space-y-4">
            <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 text-red-500" onClick={() => removeExp(index)}>
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
                <Label>Location</Label>
                <Input {...register(`experience.${index}.location`)} />
              </div>
              <div className="flex items-end pb-2 gap-2">
                <input type="checkbox" id={`current-${index}`} {...register(`experience.${index}.current`)} />
                <Label htmlFor={`current-${index}`}>I currently work here</Label>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" {...register(`experience.${index}.startDate`)} />
                {errors.experience?.[index]?.startDate && (
                  <p className="text-red-500 text-sm">{errors.experience[index]?.startDate?.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" {...register(`experience.${index}.endDate`)} disabled={isCurrent} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea {...register(`experience.${index}.description`)} />
              </div>
            </div>
          </div>
        )})}
      </div>
    </TabsContent>
  );
};
