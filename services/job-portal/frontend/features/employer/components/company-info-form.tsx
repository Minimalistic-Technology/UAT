import { UseFormReturn } from "react-hook-form";
import { CompanyFormValues } from "@/features/employer/validations/company.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationSelector } from "@/components/ui/location-selector";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";

interface CompanyInfoFormProps {
    form: UseFormReturn<CompanyFormValues>;
    onSubmit: (data: CompanyFormValues) => void;
    isPending: boolean;
    isKycCompleted: boolean;
}

export function CompanyInfoForm({ form, onSubmit, isPending, isKycCompleted }: CompanyInfoFormProps) {
    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = form;

    return (
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

                    <div className="space-y-4 col-span-full">
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
                        {(errors.location?.country || errors.location?.state || errors.location?.city) && (
                            <p className="text-sm font-medium text-destructive">Please complete all location fields.</p>
                        )}
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
    );
}
