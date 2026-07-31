import { useFormContext } from "react-hook-form";
import { CreateInternshipFormData } from "@/features/employer/validations/internship.schema";
import { LocationSelector } from "@/components/ui/location-selector";

export function InternshipLocation() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateInternshipFormData>();
  const workMode = watch("workMode");

  return (
    <section className="border-border/70 space-y-6 border-b pb-10">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Location Details</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Specify the exact location, or skip if remote.
        </p>
      </div>
      <div className="space-y-6">
        <div className="space-y-4 md:col-span-3">
          <LocationSelector
            isRequired={workMode !== "remote"}
            city={watch("location.city") || ""}
            state={watch("location.state") || ""}
            country={watch("location.country") || ""}
            onChange={(name, value) => {
              if (name === "country") {
                setValue("location.country", value, { shouldValidate: true });
                setValue("location.state", "");
                setValue("location.city", "");
              } else if (name === "state") {
                setValue("location.state", value, { shouldValidate: true });
                setValue("location.city", "");
              } else if (name === "city") {
                setValue("location.city", value, { shouldValidate: true });
              }
            }}
          />
          {(errors.location?.country ||
            errors.location?.state ||
            errors.location?.city) && (
            <p className="text-destructive text-sm font-medium">
              Please complete all location fields if the position is not remote.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
