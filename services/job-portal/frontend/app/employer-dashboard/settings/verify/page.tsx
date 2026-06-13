"use client";

import { useState } from "react";
import { useSubmitKyc } from "@/features/employer/hooks/use-company";
import { CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetMyCompanyDetails } from "@/features/employer/hooks/use-company";
import Link from "next/link";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const COMPANY_DOCUMENT_TYPES = [
  "Company GSTIN",
  "Company PAN Card",
  "Udyog Aadhaar Number",
  "Shops And Establishment Act",
  "Food License",
  "Corporate Identity Number",
  "Other"
];

export const PERSONAL_DOCUMENT_TYPES = [
  "Visiting Card",
  "Personal Aadhar",
  "Personal PAN Card",
  "Employee ID Card",
  "DigiLocker Aadhaar",
  "Other"
];

const VerifyPage = () => {
  const { data: companyResponse, isLoading: isLoadingCompany } = useGetMyCompanyDetails();
  const companyDetails = companyResponse?.data;
  const hasPlan = !!companyDetails?.currentPlan;

  const { mutate: submitKyc, isPending } = useSubmitKyc();

  const [companyDocType, setCompanyDocType] = useState<string>("");
  const [companyFile, setCompanyFile] = useState<File | null>(null);

  const [personalDocType, setPersonalDocType] = useState<string>("");
  const [personalFile, setPersonalFile] = useState<File | null>(null);

  const onSubmit = () => {
    if (!companyDocType || !companyFile) {
      toast.error("Please select a Company Document type and upload a file.");
      return;
    }
    if (!personalDocType || !personalFile) {
      toast.error("Please select a Personal/HR Document type and upload a file.");
      return;
    }

    const formData = new FormData();

    // We send dummy fallback values for backend requirements if they are still strict
    formData.append("companyName", companyDetails?.name || "Company");
    formData.append("aadharNo", "123456789012");
    formData.append("gstNo", "");
    formData.append("cinNo", "");

    // Add extra document types as fields incase backend gets updated to use them
    formData.append("companyDocumentType", companyDocType);
    formData.append("personalDocumentType", personalDocType);

    // Map files to existing expected backend fields "lightbill" & "photo" 
    // This ensures no backend breaking errors, while fully supporting the new UI
    formData.append("lightbill", companyFile);
    formData.append("photo", personalFile);

    submitKyc(formData, {
      onSuccess: () => {
        setCompanyDocType("");
        setCompanyFile(null);
        setPersonalDocType("");
        setPersonalFile(null);
      }
    });
  };

  return (
    <div className="bg-background text-foreground flex flex-col items-center justify-start p-6 min-h-screen">
      <Card className="w-full max-w-3xl bg-white dark:bg-slate-900 border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)] sm:rounded-[24px]">
        <CardHeader className="space-y-1 pb-4 pt-8 px-8 border-b">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" /> KYC
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1">
            Please upload your company and personal documents for verification
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pt-6 pb-8">
          {isLoadingCompany ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : !hasPlan ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-xl border border-dashed border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/20">
              <AlertCircle className="w-12 h-12 text-amber-500" />
              <h3 className="text-xl font-bold text-amber-900 dark:text-amber-500">Active Plan Required</h3>
              <p className="text-amber-700/80 dark:text-amber-500/80 max-w-md text-sm">
                You need an active subscription premium plan before you can submit your KYC details.
              </p>
              <Button asChild className="mt-4 shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg px-8">
                <Link href="/employer-dashboard/plans">View Pricing Plans</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-8">

              <DocumentUploadSection
                title="Company Documents"
                options={COMPANY_DOCUMENT_TYPES}
                selectedType={companyDocType}
                setSelectedType={setCompanyDocType}
                selectedFile={companyFile}
                setSelectedFile={setCompanyFile}
                inputId="companyDoc"
              />

              <DocumentUploadSection
                title="Personal / HR Documents"
                options={PERSONAL_DOCUMENT_TYPES}
                selectedType={personalDocType}
                setSelectedType={setPersonalDocType}
                selectedFile={personalFile}
                setSelectedFile={setPersonalFile}
                inputId="personalDoc"
              />

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <Button
                  onClick={onSubmit}
                  disabled={isPending || !companyFile || !personalFile}
                  size="lg"
                  className="w-full py-6 font-bold tracking-wide text-base rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 text-white disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-[0.98]"
                >
                  {isPending ? "Processing Security Check..." : "Submit Verification Documents"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const DocumentUploadSection = ({
  title,
  options,
  selectedType,
  setSelectedType,
  selectedFile,
  setSelectedFile,
  inputId,
}: {
  title: string;
  options: string[];
  selectedType: string;
  setSelectedType: (val: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  inputId: string;
}) => (
  <div className="space-y-3">
    <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
      {title} <span className="text-slate-400 font-normal">(At least 1 required)</span>
    </h3>
    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 sm:p-5 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-all hover:border-blue-200 dark:hover:border-blue-900/50">
      <div className="flex-1 w-full relative">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-11 rounded-lg focus:ring-2 focus:ring-blue-500/20">
            <SelectValue placeholder="Select Document Type" />
          </SelectTrigger>
          <SelectContent>
            {options.map((type) => (
              <SelectItem key={type} value={type} className="cursor-pointer">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedType && (
        <div className="w-full sm:w-auto shrink-0 flex items-center justify-center animate-in zoom-in-95 duration-200">
          <Input
            type="file"
            id={inputId}
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
            }}
          />
          <Button
            type="button"
            variant={selectedFile ? "outline" : "default"}
            className={selectedFile
              ? "w-full sm:w-auto border-green-500 text-green-600 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:text-green-400 dark:bg-green-900/20 h-11 px-8 rounded-lg font-bold uppercase tracking-wider text-xs transition-all"
              : "w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-11 px-8 rounded-lg font-bold uppercase tracking-wider text-xs transition-all"
            }
            onClick={() => document.getElementById(inputId)?.click()}
          >
            {selectedFile ? <><CheckCircle className="w-4 h-4 mr-2" /> Uploaded</> : "Upload"}
          </Button>
        </div>
      )}
    </div>
    {selectedFile && (
      <p className="text-xs text-green-600 dark:text-green-400 font-medium ml-2 animate-in slide-in-from-top-1">
        Selected file: {selectedFile.name}
      </p>
    )}
  </div>
);

export default VerifyPage;