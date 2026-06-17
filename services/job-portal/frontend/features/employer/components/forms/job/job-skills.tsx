import { useFormContext } from "react-hook-form";
import { CreateJobFormData } from "@/features/employer/validations/job.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Asterisk } from "lucide-react";
import { SkillInput } from "../../skill-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import {
  Gender_Preference,
  English_Fluency,
} from "@/features/employer/validations/base-listing.schema";

const formatLabel = (str: string) =>
  str
    .replace(/_/g, " ")
    .replace(/\//g, " / ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function JobSkills({ initialData }: { initialData?: any }) {
  const {
    register,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useFormContext<CreateJobFormData>();
  const currentSkills = watch("skills") || [];

  return (
    <section className="border-border/70 space-y-6 border-b pb-10">
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          Skills & Requirements
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Select specialized skills and concrete necessities.
        </p>
      </div>
      <div className="space-y-6">
        <SkillInput
          currentSkills={currentSkills}
          onChange={(skills) =>
            setValue("skills", skills, { shouldValidate: true })
          }
          error={errors.skills?.message}
        />
        <div className="grid gap-2">
          <Label className="flex items-center gap-1">
            Requirements (one per line){" "}
            <Asterisk className="text-destructive size-3" />
          </Label>
          <Textarea
            placeholder="Must have 5 years experience..."
            defaultValue={initialData?.requirements?.join("\n")}
            onChange={(e) =>
              setValue(
                "requirements",
                e.target.value.split("\n").filter(Boolean),
              )
            }
          />
          {errors.requirements && (
            <p className="text-destructive text-xs">
              {errors.requirements.message}
            </p>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label className="flex items-center gap-1">
              Number of Openings{" "}
              <Asterisk className="text-destructive size-3" />
            </Label>
            <Input
              type="number"
              min={1}
              {...register("openings", { valueAsNumber: true })}
            />
            {errors.openings && (
              <p className="text-destructive text-xs">
                {errors.openings.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>
              Gender Preference <Asterisk className="text-destructive size-3" />
            </Label>
            <Controller
              name="genderPreference"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {Gender_Preference.map((g) => (
                      <SelectItem key={g} value={g}>
                        {formatLabel(g)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.genderPreference && (
              <p className="text-destructive text-xs">
                {errors.genderPreference.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>
              English Fluency <Asterisk className="text-destructive size-3" />
            </Label>
            <Controller
              name="englishFluency"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fluency" />
                  </SelectTrigger>
                  <SelectContent>
                    {English_Fluency.map((e) => (
                      <SelectItem key={e} value={e}>
                        {formatLabel(e)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.englishFluency && (
              <p className="text-destructive text-xs">
                {errors.englishFluency.message as string}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
