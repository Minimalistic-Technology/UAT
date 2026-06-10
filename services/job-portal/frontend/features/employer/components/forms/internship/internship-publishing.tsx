import { useFormContext, Controller } from "react-hook-form";
import { CreateInternshipFormData } from "@/features/employer/validations/internship.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export function InternshipPublishing({ initialData }: { initialData?: any }) {
    const { register, control, setValue, formState: { errors } } = useFormContext<CreateInternshipFormData>();

    return (
        <section className="space-y-6 pb-2">
            <div>
                <h2 className="text-xl font-bold tracking-tight">Publishing & Perks</h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Dates, visibility settings, and added benefits.</p>
            </div>
            <div className="space-y-6">
                <div className="grid gap-2">
                    <Label>Benefits (One per line)</Label>
                    <Textarea
                        placeholder="Free meals&#10;Transport allowance..."
                        defaultValue={initialData?.benefits?.join("\n")}
                        onChange={(e) =>
                            setValue(
                                "benefits",
                                e.target.value.split("\n").filter((val) => val.trim() !== ""),
                            )
                        }
                        className="min-h-37.5"
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Application Deadline</Label>
                        <Input
                            min={new Date().toISOString().split("T")[0]}
                            type="date"
                            {...register("applicationDeadline")}
                        />
                        {errors.applicationDeadline && <p className="text-destructive text-xs">{errors.applicationDeadline.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label>Visibility</Label>
                        <div className="flex items-center space-x-2 rounded-lg border p-4">
                            <Controller
                                name="isFeatured"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id="intern-featured" checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor="intern-featured" className="cursor-pointer font-normal">Feature this listing</Label>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
