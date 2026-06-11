import { useFormContext, Controller } from "react-hook-form";
import { CreateJobFormData } from "@/features/employer/validations/job.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function JobSalary() {
    const { register, control, formState: { errors } } = useFormContext<CreateJobFormData>();

    return (
        <section className="space-y-6 border-b pb-10 border-border/70">
            <div>
                <h2 className="text-xl font-bold tracking-tight">Salary Range</h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Establish base compensation details to attract applicants.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-4 items-end">
                <div className="grid gap-2">
                    <Label>Min</Label>
                    <Input min={0} type="number" {...register("salary.min")} />
                    {errors.salary?.min && <p className="text-destructive text-xs">{errors.salary.min.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label>Max</Label>
                    <Input min={0} type="number" {...register("salary.max")} />
                    {errors.salary?.max && <p className="text-destructive text-xs">{errors.salary.max.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label>Currency</Label>
                    <Controller
                        name="salary.currency"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INR">INR</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Period</Label>
                    <Controller
                        name="salary.period"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hourly">Hourly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                {errors.salary?.max && (
                    <p className="text-destructive text-xs md:col-start-2">{errors.salary.max.message}</p>
                )}
            </div>
        </section>
    );
}
