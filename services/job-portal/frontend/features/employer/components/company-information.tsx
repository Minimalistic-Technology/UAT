import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Country, State, City } from "country-state-city";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateCompany } from "@/features/employer/hooks/use-company";
import { Loader2 } from "lucide-react";
import { companyFormSchema, CompanyFormValues } from "@/features/employer/validations/company.schema";
import { KycStatus } from "@/types/enums";
import { useGetUserDetails } from "@/hooks/use-user";
import { toast } from "sonner";

export const CompanyInformation = ({ company }: { company: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateCompany, isPending } = useUpdateCompany();
  const { data: userDetailsResponse } = useGetUserDetails();
  
  const user = userDetailsResponse?.data;
  const isOwner = user && company?.owner?._id === user._id;

  const isKycCompleted = company?.kycStatus === KycStatus.APPROVED;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company?.name || "",
      description: company?.description || "",
      website: company?.website || "",
      industry: company?.industry || "",
      companySize: company?.companySize || "",
      location: {
        address: company?.location?.address || "",
        city: company?.location?.city || "",
        state: company?.location?.state || "",
        country: company?.location?.country || "",
        zipCode: company?.location?.zipCode || "",
      },
      socialLinks: {
        linkedin: company?.socialLinks?.linkedin || "",
        twitter: company?.socialLinks?.twitter || "",
        facebook: company?.socialLinks?.facebook || "",
      },
    },
  });

  // Reset form when company data is fetched
  useEffect(() => {
    if (company) {
      reset({
        name: company.name || "",
        description: company.description || "",
        website: company.website || "",
        industry: company.industry || "",
        companySize: company.companySize || "",
        location: {
          address: company.location?.address || "",
          city: company.location?.city || "",
          state: company.location?.state || "",
          country: company.location?.country || "",
          zipCode: company.location?.zipCode || "",
        },
        socialLinks: {
          linkedin: company.socialLinks?.linkedin || "",
          twitter: company.socialLinks?.twitter || "",
          facebook: company.socialLinks?.facebook || "",
        },
      });
    }
  }, [company, reset]);

  const selectedCountryName = watch("location.country");
  const selectedStateName = watch("location.state");
  const selectedCountryCode = selectedCountryName ? Country.getAllCountries().find(c => c.name === selectedCountryName)?.isoCode : "";
  const selectedStateCode = (selectedStateName && selectedCountryCode) ? State.getStatesOfCountry(selectedCountryCode).find(s => s.name === selectedStateName)?.isoCode : "";

  const onSubmit = (data: CompanyFormValues) => {
    // @ts-ignore
    updateCompany(data, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4 bg-slate-50/50">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Company Information
          </h3>
          <p className="text-sm text-slate-500">
            Manage your company details and location
          </p>
        </div>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => {
            if (isEditing) {
              reset();
              setIsEditing(false);
            } else {
              if (!isOwner) {
                toast.error("You are not authorized to update the company profile");
                return;
              }
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? "Cancel" : "Edit Details"}
        </Button>
      </div>

      <div className="p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  placeholder="Acme Inc."
                  {...register("name")}
                  readOnly={isKycCompleted}
                  className={isKycCompleted ? "bg-slate-50 cursor-not-allowed text-slate-500 focus-visible:ring-0" : ""}
                />
                {isKycCompleted && (
                  <p className="text-xs text-slate-500">
                    Company name cannot be changed after KYC is completed.
                  </p>
                )}
                {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="e.g. Technology" {...register("industry")} />
                {errors.industry && <p className="text-sm font-medium text-destructive">{errors.industry.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your company..."
                className="resize-none h-32"
                {...register("description")}
              />
              {errors.description && <p className="text-sm font-medium text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://example.com" {...register("website")} />
                {errors.website && <p className="text-sm font-medium text-destructive">{errors.website.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
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
                {errors.companySize && <p className="text-sm font-medium text-destructive">{errors.companySize.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Location Details</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 col-span-full">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Street address" {...register("location.address")} />
                  {errors.location?.address && <p className="text-sm font-medium text-destructive">{errors.location.address.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Controller
                    name="location.country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          setValue("location.state", "");
                          setValue("location.city", "");
                        }}
                        value={field.value || ""}
                      >
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {Country.getAllCountries().map(country => (
                            <SelectItem key={country.isoCode} value={country.name}>{country.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.location?.country && <p className="text-sm font-medium text-destructive">{errors.location.country.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Controller
                    name="location.state"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          setValue("location.city", "");
                        }}
                        value={field.value || ""}
                        disabled={!selectedCountryCode}
                      >
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCountryCode && State.getStatesOfCountry(selectedCountryCode).map(state => (
                            <SelectItem key={state.isoCode} value={state.name}>{state.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.location?.state && <p className="text-sm font-medium text-destructive">{errors.location.state.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Controller
                    name="location.city"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""} disabled={!selectedStateCode}>
                        <SelectTrigger id="city">
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCountryCode && selectedStateCode && City.getCitiesOfState(selectedCountryCode, selectedStateCode).map(city => (
                            <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.location?.city && <p className="text-sm font-medium text-destructive">{errors.location.city.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                  <Input id="zipCode" placeholder="Zip Code" {...register("location.zipCode")} />
                  {errors.location?.zipCode && <p className="text-sm font-medium text-destructive">{errors.location.zipCode.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Social Links</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input id="linkedin" placeholder="https://linkedin.com/company/..." {...register("socialLinks.linkedin")} />
                  {errors.socialLinks?.linkedin && <p className="text-sm font-medium text-destructive">{errors.socialLinks.linkedin.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input id="twitter" placeholder="https://twitter.com/..." {...register("socialLinks.twitter")} />
                  {errors.socialLinks?.twitter && <p className="text-sm font-medium text-destructive">{errors.socialLinks.twitter.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input id="facebook" placeholder="https://facebook.com/..." {...register("socialLinks.facebook")} />
                  {errors.socialLinks?.facebook && <p className="text-sm font-medium text-destructive">{errors.socialLinks.facebook.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-1">Description</h4>
              <p className="text-sm text-slate-900 whitespace-pre-line">
                {company.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">Company Size</h4>
                <p className="text-sm text-slate-900 font-medium">
                  {company.companySize || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">Industry</h4>
                <p className="text-sm text-slate-900 font-medium">
                  {company.industry || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">Location</h4>
                <p className="text-sm text-slate-900 font-medium">
                  {company.location?.city || "City"},{" "}
                  {company.location?.country || "Country"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
