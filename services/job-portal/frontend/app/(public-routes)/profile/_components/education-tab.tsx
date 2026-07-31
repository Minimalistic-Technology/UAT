import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileFormValues } from "@/validations";

export const EducationTab = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProfileFormValues>();

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <TabsContent value="education" className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Education</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendEdu({
              degree: "",
              institution: "",
              graduationYear: new Date().getFullYear(),
              fieldOfStudy: "",
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Education
        </Button>
      </div>
      <div className="space-y-6">
        {eduFields.map((field, index) => (
          <div
            key={field.id}
            className="relative space-y-4 rounded-md border p-4"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-red-500"
              onClick={() => removeEdu(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input {...register(`education.${index}.degree`)} />
                {errors.education?.[index]?.degree && (
                  <p className="text-sm text-red-500">
                    {errors.education[index]?.degree?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input {...register(`education.${index}.institution`)} />
                {errors.education?.[index]?.institution && (
                  <p className="text-sm text-red-500">
                    {errors.education[index]?.institution?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Field of Study</Label>
                <Input {...register(`education.${index}.fieldOfStudy`)} />
              </div>
              <div className="space-y-2">
                <Label>Graduation Year</Label>
                <Input
                  type="number"
                  min={1900}
                  {...register(`education.${index}.graduationYear`, {
                    valueAsNumber: true,
                  })}
                />
                {errors.education?.[index]?.graduationYear && (
                  <p className="text-sm text-red-500">
                    {errors.education[index]?.graduationYear?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </TabsContent>
  );
};
