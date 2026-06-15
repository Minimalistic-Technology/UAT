import { useFormContext, Controller } from "react-hook-form";
import { CreateInternshipFormData } from "@/features/employer/validations/internship.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asterisk } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Degree_Level } from "@/features/employer/validations/base-listing.schema";

const formatLabel = (str: string) => str.replace(/_/g, " ").replace(/\//g, " / ").replace(/\b\w/g, (c) => c.toUpperCase());

export function InternshipEducation() {
    const { control, setValue, formState: { errors } } = useFormContext<CreateInternshipFormData>();

    return (
        <section className="space-y-6 border-b pb-10 border-border/70">
            <div>
                <h2 className="text-xl font-bold tracking-tight">Education Requirements</h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Define what academic background the candidate needs.</p>
            </div>
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Minimum Qualification <Asterisk className="text-destructive size-3" /></Label>
                        <Controller
                            name="education.minimumDegree"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select minimum qualification" /></SelectTrigger>
                                    <SelectContent>
                                        {Degree_Level.map((lvl) => (
                                            <SelectItem key={lvl} value={lvl}>{formatLabel(lvl)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Preferred Fields (Comma separated)</Label>
                        <Input
                            placeholder="e.g. Computer Science, Information Technology"
                            onChange={(e) => {
                                const arr = e.target.value.split(",").map((val) => val.trim()).filter(Boolean);
                                setValue("education.preferredFields", arr);
                            }}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-4">
                    <Controller
                        name="education.isRequired"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id="edu-required" checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label htmlFor="edu-required" className="cursor-pointer">Minimum qualification should be mandatory ?</Label>
                </div>
            </div>
        </section>
    );
}
