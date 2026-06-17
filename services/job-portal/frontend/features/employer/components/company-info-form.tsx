import { UseFormReturn } from "react-hook-form";
import { CompanyFormValues } from "@/features/employer/validations/company.schema";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationSelector } from "@/components/ui/location-selector";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { EditProfileInputField } from "./profile";

interface CompanyInfoFormProps {
  form: UseFormReturn<CompanyFormValues>;
  onSubmit: (data: CompanyFormValues) => void;
  isPending: boolean;
  isKycCompleted: boolean;
}

export function CompanyInfoForm({
  form,
  onSubmit,
  isPending,
  isKycCompleted,
}: CompanyInfoFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="scrollbar-hide space-y-6 px-6 pb-4"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <EditProfileInputField
          label="Company Name"
          id="name"
          placeholder="Acme Inc."
          {...register("name")}
          readOnly={isKycCompleted}
          className={
            isKycCompleted
              ? "cursor-not-allowed bg-slate-50 text-slate-500 focus-visible:ring-0"
              : ""
          }
          description={
            isKycCompleted
              ? "Company name cannot be changed after KYC is completed."
              : undefined
          }
          error={errors.name?.message}
        />

        <EditProfileInputField
          label="Industry"
          id="industry"
          placeholder="e.g. Technology"
          {...register("industry")}
          readOnly={isKycCompleted}
          className={
            isKycCompleted
              ? "cursor-not-allowed bg-slate-50 text-slate-500 focus-visible:ring-0"
              : ""
          }
          description={
            isKycCompleted
              ? "Industry cannot be changed after KYC is completed."
              : undefined
          }
          error={errors.industry?.message}
        />
      </div>

      <EditProfileInputField
        label="Description"
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          placeholder="Tell us about your company..."
          className="h-32 resize-none"
          {...register("description")}
        />
      </EditProfileInputField>

      <div className="grid gap-6 md:grid-cols-2">
        <EditProfileInputField
          label="Website"
          id="website"
          placeholder="https://example.com"
          {...register("website")}
          error={errors.website?.message}
        />

        <EditProfileInputField
          label="Company Size"
          error={errors.companySize?.message}
        >
          <Controller
            control={control}
            name="companySize"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="companySize">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </EditProfileInputField>
      </div>

      <div className="space-y-4">
        <h4 className="border-b pb-2 text-sm font-semibold text-slate-900">
          Location Details
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          <EditProfileInputField
            containerClassName="col-span-full"
            label="Address"
            id="address"
            placeholder="Street address"
            {...register("location.address")}
            error={errors.location?.address?.message}
          />

          <div className="col-span-full space-y-4">
            <LocationSelector
              city={watch("location.city") || ""}
              state={watch("location.state") || ""}
              country={watch("location.country") || ""}
              onChange={(name, value) => {
                if (name === "country") {
                  setValue("location.country", value);
                  setValue("location.state", "");
                  setValue("location.city", "");
                } else if (name === "state") {
                  setValue("location.state", value);
                  setValue("location.city", "");
                } else if (name === "city") {
                  setValue("location.city", value);
                }
              }}
            />
            {(errors.location?.country ||
              errors.location?.state ||
              errors.location?.city) && (
              <p className="text-destructive text-sm font-medium">
                Please complete all location fields.
              </p>
            )}
          </div>

          <EditProfileInputField
            label="ZIP / Postal Code"
            id="zipCode"
            placeholder="Zip Code"
            {...register("location.zipCode")}
            error={errors.location?.zipCode?.message}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="border-b pb-2 text-sm font-semibold text-slate-900">
          Social Links
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          <EditProfileInputField
            label="LinkedIn URL"
            id="linkedin"
            placeholder="https://linkedin.com/company/..."
            {...register("socialLinks.linkedin")}
            error={errors.socialLinks?.linkedin?.message}
          />

          <EditProfileInputField
            label="Twitter URL"
            id="twitter"
            placeholder="https://twitter.com/..."
            {...register("socialLinks.twitter")}
            error={errors.socialLinks?.twitter?.message}
          />

          <EditProfileInputField
            label="Facebook URL"
            id="facebook"
            placeholder="https://facebook.com/..."
            {...register("socialLinks.facebook")}
            error={errors.socialLinks?.facebook?.message}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
