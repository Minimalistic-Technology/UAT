import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileFormValues } from "@/validations";

export const SkillsLanguagesTab = () => {
  const {
    watch,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<ProfileFormValues>();

  const skills = watch("skills") || [];
  const languages = watch("languages") || [];

  const skillRefs = useRef<(HTMLInputElement | null)[]>([]);
  const languageRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus last skill input when a new one is added
  useEffect(() => {
    if (skills.length > 0) {
      skillRefs.current[skills.length - 1]?.focus();
    }
  }, [skills.length]);

  // Focus last language input when a new one is added
  useEffect(() => {
    if (languages.length > 0) {
      languageRefs.current[languages.length - 1]?.focus();
    }
  }, [languages.length]);

  const addSkill = () => {
    if (skills.length > 0 && skills[skills.length - 1].trim() === "") return;
    setValue("skills", [...skills, ""]);
  };
  const removeSkill = (index: number) =>
    setValue(
      "skills",
      skills.filter((_, i) => i !== index),
    );

  const addLanguage = () => {
    if (languages.length > 0 && languages[languages.length - 1].trim() === "")
      return;
    setValue("languages", [...languages, ""]);
  };
  const removeLanguage = (index: number) =>
    setValue(
      "languages",
      languages.filter((_, i) => i !== index),
    );

  return (
    <TabsContent value="skills" className="space-y-6 pt-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Skills</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSkill}>
            <Plus className="mr-2 h-4 w-4" /> Add Skill
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {skills.map((_, index) => {
            const { ref, ...rest } = register(`skills.${index}` as const);
            return (
              <div key={`skill-${index}`} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Input
                    {...rest}
                    ref={(el) => {
                      skillRefs.current[index] = el;
                      ref(el);
                    }}
                    placeholder="e.g. React"
                    onBlur={(e) => {
                      if (e.target.value.trim() === "") removeSkill(index);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                {errors.skills?.[index] && (
                  <p className="text-sm text-red-500">
                    {errors.skills[index]?.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Languages</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLanguage}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Language
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {languages.map((_, index) => {
            const { ref, ...rest } = register(`languages.${index}` as const);
            return (
              <div key={`language-${index}`} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Input
                    {...rest}
                    ref={(el) => {
                      languageRefs.current[index] = el;
                      ref(el);
                    }}
                    placeholder="e.g. English"
                    onBlur={(e) => {
                      if (e.target.value.trim() === "") removeLanguage(index);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                {errors.languages?.[index] && (
                  <p className="text-sm text-red-500">
                    {errors.languages[index]?.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TabsContent>
  );
};
