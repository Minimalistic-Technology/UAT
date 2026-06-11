"use client";

import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { useSubmitKyc } from "@/features/employer/hooks/use-company";
import { Upload, CheckCircle, Building2, CreditCard, ReceiptText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useGetMyCompanyDetails } from "@/features/employer/hooks/use-company";
import Link from "next/link";

interface KycFormValues {
  companyName: string;
  aadharNo: string;
  gstNo: string;
  cinNo: string;
  photo: FileList;
  lightbill: FileList;
}

const VerifyPage = () => {
  const { data: companyResponse, isLoading: isLoadingCompany } = useGetMyCompanyDetails();
  const companyDetails = companyResponse?.data;
  const hasPlan = !!companyDetails?.currentPlan;

  const { mutate: submitKyc, isPending } = useSubmitKyc();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<KycFormValues>();

  const onSubmit = (data: KycFormValues) => {
    const formData = new FormData();
    formData.append("companyName", data.companyName);
    formData.append("aadharNo", data.aadharNo);
    formData.append("gstNo", data.gstNo || "");
    formData.append("cinNo", data.cinNo || "");
    
    if (data.photo?.[0]) formData.append("photo", data.photo[0]);
    if (data.lightbill?.[0]) formData.append("lightbill", data.lightbill[0]);

    submitKyc(formData);
  };

  const photoFile = watch("photo")?.[0];
  const lightbillFile = watch("lightbill")?.[0];

  return (
    <div className="bg-background text-foreground flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-card border-border shadow-2xl space-y-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Verify Identity
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Complete your KYC to access premium legal services.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoadingCompany ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : !hasPlan ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500" />
              <h3 className="text-xl font-bold">Active Plan Required</h3>
              <p className="text-muted-foreground">
                You need an active subscription plan before you can submit your KYC details.
              </p>
              <Button asChild className="mt-4">
                <Link href="/employer-dashboard/plans">View Pricing Plans</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Text Inputs */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className={errors.companyName ? "text-destructive" : "text-muted-foreground"}>Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    id="companyName"
                    placeholder="Acme Corp" 
                    className={cn("pl-10 bg-background focus-visible:ring-ring", errors.companyName ? "border-destructive focus-visible:ring-destructive" : "border-input")}
                    {...register("companyName", { required: "Company Name is required" })}
                  />
                </div>
                {errors.companyName && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={12} /> {errors.companyName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadharNo" className={errors.aadharNo ? "text-destructive" : "text-muted-foreground"}>Aadhar Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    id="aadharNo"
                    placeholder="123456789012" 
                    className={cn("pl-10 bg-background focus-visible:ring-ring", errors.aadharNo ? "border-destructive focus-visible:ring-destructive" : "border-input")}
                    {...register("aadharNo", { 
                      required: "Aadhar Number is required",
                      pattern: { value: /^\d{12}$/, message: "Must be exactly 12 digits" }
                    })}
                  />
                </div>
                {errors.aadharNo && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={12} /> {errors.aadharNo.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNo" className={errors.gstNo ? "text-destructive" : "text-muted-foreground"}>GST Number</Label>
                <div className="relative">
                  <ReceiptText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    id="gstNo"
                    placeholder="22AAAAA0000A1Z5" 
                    className={cn("pl-10 bg-background focus-visible:ring-ring", errors.gstNo ? "border-destructive focus-visible:ring-destructive" : "border-input")}
                    {...register("gstNo", {
                      required: "GST Number is required",
                      pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, message: "Invalid GST format" }
                    })}
                  />
                </div>
                {errors.gstNo && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={12} /> {errors.gstNo.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cinNo" className={errors.cinNo ? "text-destructive" : "text-muted-foreground"}>CIN Number</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    id="cinNo"
                    placeholder="U12345MH2023PTC123456" 
                    className={cn("pl-10 bg-background focus-visible:ring-ring", errors.cinNo ? "border-destructive focus-visible:ring-destructive" : "border-input")}
                    {...register("cinNo", {
                      required: "CIN Number is required",
                      pattern: { value: /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/i, message: "Invalid CIN format" }
                    })}
                  />
                </div>
                {errors.cinNo && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={12} /> {errors.cinNo.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* File Uploads */}
              <FileUploadField 
                label="Passport Photo" 
                registration={register("photo", { required: "Passport Photo is required" })}
                file={photoFile} 
                error={errors.photo?.message}
                accept="image/*"
              />
              <FileUploadField 
                label="Electricity Bill (PDF/Img)" 
                registration={register("lightbill", { required: "Electricity Bill is required" })}
                file={lightbillFile} 
                error={errors.lightbill?.message}
                accept="image/*,.pdf"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              size="lg"
              className="w-full py-6 font-semibold text-base rounded-xl mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? "Processing..." : "Submit KYC Details"}
            </Button>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const FileUploadField = ({ 
  label, 
  registration, 
  file, 
  error,
  accept 
}: { 
  label: string;
  registration: UseFormRegisterReturn;
  file?: File;
  error?: string;
  accept?: string;
}) => (
  <div className="space-y-2">
    <Label className={error ? "text-destructive" : "text-muted-foreground"}>{label}</Label>
    <label className="cursor-pointer group block">
      <div className={cn(
        "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all",
        error ? "border-destructive/50 bg-destructive/5 group-hover:border-destructive group-hover:bg-destructive/10" :
        file 
          ? "border-primary/50 bg-primary/5" 
          : "border-input bg-background group-hover:border-accent-foreground/20 group-hover:bg-accent/50"
      )}>
        {file ? (
          <CheckCircle className="text-primary" size={24} />
        ) : (
          <Upload className={error ? "text-destructive/70 group-hover:text-destructive" : "text-muted-foreground group-hover:text-foreground transition-colors"} size={24} />
        )}
        <span className={cn(
          "text-xs text-center truncate max-w-[180px]",
          error ? "text-destructive" :
          file ? "text-primary font-medium" : "text-muted-foreground"
        )}>
          {file ? file.name : "Click to upload"}
        </span>
      </div>
      <input 
        type="file" 
        className="hidden" 
        {...registration}
        accept={accept} 
      />
    </label>
    {error && <p className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertCircle size={12} /> {error}</p>}
  </div>
);

export default VerifyPage;