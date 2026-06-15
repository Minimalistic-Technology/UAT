import { useFormContext, Controller } from "react-hook-form";
import { CreateJobFormData } from "@/features/employer/validations/job.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Asterisk } from "lucide-react";
import { Degree_Level } from "@/features/employer/validations/base-listing.schema";

export function JobEducation() {
    const { register, control, setValue, formState: { errors } } = useFormContext<CreateJobFormData>();

    return (
        <section className="space-y-6 border-b pb-10 border-border/70">
            <div>
                <h2 className="text-xl font-bold tracking-tight">Education Requirements</h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Define what academic background the candidate needs.</p>
            </div>
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Minimum Qualification <Asterisk className="text-destructive inline size-3" /></Label>
                        <Controller
                            name="education.minimumDegree"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger>
                                    <SelectContent>
                                        {Degree_Level.map((degree) => (
                                            <SelectItem key={degree} value={degree}>
                                                {degree.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.education?.minimumDegree && (
                            <p className="text-destructive text-xs">{errors.education.minimumDegree.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label>Preferred Fields (comma-separated)</Label>
                        <Input
                            placeholder="e.g. Computer Science, Information Technology"
                            onChange={(e) =>
                                setValue(
                                    "education.preferredFields",
                                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                                )
                            }
                        />
                        {errors.education?.preferredFields && (
                            <p className="text-destructive text-xs">{errors.education.preferredFields.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-4">
                    <Controller
                        name="education.isRequired"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id="educationRequired" checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label htmlFor="educationRequired" className="cursor-pointer">Minimum qualification should be mandatory ?</Label>
                </div>
            </div>
        </section>
    );
}
