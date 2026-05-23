import { useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileFormValues } from "@/validations";

export const SkillsLanguagesTab = () => {
  const { watch, setValue, register, formState: { errors } } = useFormContext<ProfileFormValues>();

  const skills = watch("skills") || [];
  const languages = watch("languages") || [];

  const addSkill = () => setValue("skills", [...skills, ""]);
  const removeSkill = (index: number) => setValue("skills", skills.filter((_, i) => i !== index));

  const addLanguage = () => setValue("languages", [...languages, ""]);
  const removeLanguage = (index: number) => setValue("languages", languages.filter((_, i) => i !== index));

  return (
    <TabsContent value="skills" className="space-y-6 pt-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Skills</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSkill}>
            <Plus className="h-4 w-4 mr-2" /> Add Skill
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {skills.map((_, index) => (
            <div key={`skill-${index}`} className="space-y-1">
              <div className="flex items-center gap-2">
                <Input {...register(`skills.${index}` as const)} placeholder="e.g. React" />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeSkill(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              {errors.skills?.[index] && (
                <p className="text-red-500 text-sm">{errors.skills[index]?.message}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Languages</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
            <Plus className="h-4 w-4 mr-2" /> Add Language
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {languages.map((_, index) => (
            <div key={`language-${index}`} className="space-y-1">
              <div className="flex items-center gap-2">
                <Input {...register(`languages.${index}` as const)} placeholder="e.g. English" />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeLanguage(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              {errors.languages?.[index] && (
                <p className="text-red-500 text-sm">{errors.languages[index]?.message}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </TabsContent>
  );
};
