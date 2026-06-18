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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const COMPANY_DOCUMENT_TYPES = [
  "Company GSTIN",
  "Company PAN Card",
  "Udyog Aadhaar Number",
  "Shops And Establishment Act",
  "Food License",
  "Corporate Identity Number",
  "Other",
];

export const PERSONAL_DOCUMENT_TYPES = [
  "Visiting Card",
  "Personal Aadhar",
  "Personal PAN Card",
  "Employee ID Card",
  "DigiLocker Aadhaar",
  "Other",
];

const VerifyPage = () => {
  const { data: companyResponse, isLoading: isLoadingCompany } =
    useGetMyCompanyDetails();
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
      toast.error(
        "Please select a Personal/HR Document type and upload a file.",
      );
      return;
    }

    const formData = new FormData();

    formData.append("companyDocumentType", companyDocType);
    formData.append("personalDocumentType", personalDocType);

    formData.append("companyDocument", companyFile);
    formData.append("personalDocument", personalFile);

    submitKyc(formData, {
      onSuccess: () => {
        setCompanyDocType("");
        setCompanyFile(null);
        setPersonalDocType("");
        setPersonalFile(null);
      },
    });
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-start p-6">
      <Card className="w-full max-w-3xl border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] sm:rounded-[24px] dark:bg-slate-900">
        <CardHeader className="space-y-1 border-b px-8 pt-8 pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            <ShieldCheck className="h-7 w-7 text-blue-600" /> KYC
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-slate-500">
            Please upload your company and personal documents for verification
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pt-6 pb-8">
          {isLoadingCompany ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : !hasPlan ? (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-amber-200 bg-amber-50 p-12 text-center dark:border-amber-500/20 dark:bg-amber-500/10">
              <AlertCircle className="h-12 w-12 text-amber-500" />
              <h3 className="text-xl font-bold text-amber-900 dark:text-amber-500">
                Active Plan Required
              </h3>
              <p className="max-w-md text-sm text-amber-700/80 dark:text-amber-500/80">
                You need an active subscription premium plan before you can
                submit your KYC details.
              </p>
              <Button
                asChild
                className="mt-4 rounded-lg bg-amber-500 px-8 font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600"
              >
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

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800/80">
                <Button
                  onClick={onSubmit}
                  disabled={isPending || !companyFile || !personalFile}
                  size="lg"
                  className="w-full rounded-xl bg-blue-600 py-6 text-base font-bold tracking-wide text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isPending
                    ? "Processing Security Check..."
                    : "Submit Verification Documents"}
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
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {title}
      </h3>
      <span className="text-xs font-normal text-slate-400">
        Supported formats: PDF, JPEG, PNG, WEBP (Max 5MB)
      </span>
    </div>
    <div className="flex flex-col items-start gap-4 rounded-xl border border-slate-200/60 bg-slate-50 p-4 transition-all hover:border-blue-200 sm:flex-row sm:items-center sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-900/50">
      <div className="relative w-full flex-1">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="h-11 w-full rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900">
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
        <div className="animate-in zoom-in-95 flex w-full shrink-0 items-center justify-center duration-200 sm:w-auto">
          <Input
            type="file"
            id={inputId}
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const validTypes = [
                  "image/jpeg",
                  "image/jpg",
                  "image/png",
                  "image/webp",
                  "application/pdf",
                ];
                if (!validTypes.includes(file.type)) {
                  toast.error(
                    "Invalid file type. Only PDF, JPEG, PNG, and WEBP are allowed.",
                  );
                  e.target.value = "";
                  return;
                }
                if (file.size > 5 * 1024 * 1024) {
                  toast.error("File is too large. Maximum size is 5MB.");
                  e.target.value = "";
                  return;
                }
                setSelectedFile(file);
              }
            }}
          />
          <Button
            type="button"
            variant={selectedFile ? "outline" : "default"}
            className={
              selectedFile
                ? "h-11 w-full rounded-lg border-green-500 bg-green-50 px-8 text-xs font-bold tracking-wider text-green-600 uppercase transition-all hover:bg-green-100 sm:w-auto dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "h-11 w-full rounded-lg bg-blue-600 px-8 text-xs font-bold tracking-wider text-white uppercase shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 sm:w-auto"
            }
            onClick={() => document.getElementById(inputId)?.click()}
          >
            {selectedFile ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Uploaded
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      )}
    </div>
    {selectedFile && (
      <p className="animate-in slide-in-from-top-1 ml-2 text-xs font-medium text-green-600 dark:text-green-400">
        Selected file: {selectedFile.name}
      </p>
    )}
  </div>
);

export default VerifyPage;
