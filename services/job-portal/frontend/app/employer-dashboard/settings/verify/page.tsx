"use client";

import React, { useState } from "react";
import { useSubmitKyc } from "@/features/employer/hooks/use-company";
import { Upload, CheckCircle, Building2, CreditCard, ReceiptText } from "lucide-react";
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

const VerifyPage = () => {
  const { mutate: submitKyc, isPending } = useSubmitKyc();
  const [files, setFiles] = useState<{ photo: File | null; lightbill: File | null }>({
    photo: null,
    lightbill: null,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (files.photo) formData.append("photo", files.photo);
    if (files.lightbill) formData.append("lightbill", files.lightbill);

    submitKyc(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'lightbill') => {
    if (e.target.files?.[0]) {
      setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Text Inputs */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-muted-foreground">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    id="companyName"
                    name="companyName" 
                    placeholder="Acme Corp" 
                    className="pl-10 bg-background border-input focus-visible:ring-ring"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadharNo" className="text-muted-foreground">Aadhar Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    id="aadharNo"
                    name="aadharNo" 
                    placeholder="[Aadhaar Redacted]" 
                    className="pl-10 bg-background border-input focus-visible:ring-ring"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNo" className="text-muted-foreground">GST Number</Label>
                <div className="relative">
                  <ReceiptText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    id="gstNo"
                    name="gstNo" 
                    placeholder="22AAAAA0000A1Z5" 
                    className="pl-10 bg-background border-input focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cinNo" className="text-muted-foreground">CIN Number</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    id="cinNo"
                    name="cinNo" 
                    placeholder="U12345MH2023PTC123456" 
                    className="pl-10 bg-background border-input focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* File Uploads */}
              <FileUploadField 
                label="Passport Photo" 
                onChange={(e) => handleFileChange(e, 'photo')} 
                file={files.photo} 
              />
              <FileUploadField 
                label="Electricity Bill (PDF/Img)" 
                onChange={(e) => handleFileChange(e, 'lightbill')} 
                file={files.lightbill} 
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
        </CardContent>
      </Card>
    </div>
  );
};

const FileUploadField = ({ label, onChange, file }: { label: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, file: File | null }) => (
  <div className="space-y-2">
    <Label className="text-muted-foreground">{label}</Label>
    <label className="cursor-pointer group block">
      <div className={cn(
        "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all",
        file 
          ? "border-primary/50 bg-primary/5" 
          : "border-input bg-background group-hover:border-accent-foreground/20 group-hover:bg-accent/50"
      )}>
        {file ? (
          <CheckCircle className="text-primary" size={24} />
        ) : (
          <Upload className="text-muted-foreground group-hover:text-foreground transition-colors" size={24} />
        )}
        <span className={cn(
          "text-xs text-center truncate max-w-[180px]",
          file ? "text-primary font-medium" : "text-muted-foreground"
        )}>
          {file ? file.name : "Click to upload"}
        </span>
      </div>
      <input 
        type="file" 
        className="hidden" 
        onChange={onChange} 
        accept="image/*,.pdf" 
      />
    </label>
  </div>
);

export default VerifyPage;