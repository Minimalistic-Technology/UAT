import { useFormContext, Controller } from "react-hook-form";
import { CreateInternshipFormData } from "@/features/employer/validations/internship.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Asterisk } from "lucide-react";
import { Work_Mode, Company_Type, ROLE_CATEGORIES, INDUSTRIES } from "@/features/employer/validations/base-listing.schema";

const formatLabel = (str: string) => str.replace(/_/g, " ").replace(/\//g, " / ").replace(/\b\w/g, (c) => c.toUpperCase());

export function InternshipBasicInfo() {
    const { register, control, formState: { errors } } = useFormContext<CreateInternshipFormData>();

    return (
        <section className="space-y-6 border-b pb-10 border-border/70">
            <div>
                <h2 className="text-xl font-bold tracking-tight">Basic Information</h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Provide the foundational details for the internship securely down below.</p>
            </div>
            <div className="space-y-6">
                <div className="grid gap-2">
                    <Label className="flex items-center gap-1">
                        Internship Title <Asterisk className="text-destructive size-3" />
                    </Label>
                    <Input {...register("title")} placeholder="e.g. Frontend Developer Intern" />
                    {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label className="flex items-center gap-1">
                        Description <Asterisk className="text-destructive size-3" />
                    </Label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
                    />
                    {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Work Mode <Asterisk className="text-destructive size-3" /></Label>
                        <Controller
                            name="workMode"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select work mode" /></SelectTrigger>
                                    <SelectContent>
                                        {Work_Mode.map((mode) => (
                                            <SelectItem key={mode} value={mode}>{formatLabel(mode)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.workMode && <p className="text-destructive text-xs">{errors.workMode.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label>Company Type <Asterisk className="text-destructive size-3" /></Label>
                        <Controller
                            name="companyType"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select company type" /></SelectTrigger>
                                    <SelectContent>
                                        {Company_Type.map((type) => (
                                            <SelectItem key={type} value={type}>{formatLabel(type)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.companyType && <p className="text-destructive text-xs">{errors.companyType.message}</p>}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Role Category <Asterisk className="text-destructive size-3" /></Label>
                        <Controller
                            name="roleCategory"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        {ROLE_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{formatLabel(cat)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.roleCategory && <p className="text-destructive text-xs">{errors.roleCategory.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label>Industry <Asterisk className="text-destructive size-3" /></Label>
                        <Controller
                            name="industry"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                                    <SelectContent>
                                        {INDUSTRIES.map((ind) => (
                                            <SelectItem key={ind} value={ind}>{formatLabel(ind)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.industry && <p className="text-destructive text-xs">{errors.industry.message}</p>}
                    </div>
                </div>
            </div>
        </section>
    );
}
