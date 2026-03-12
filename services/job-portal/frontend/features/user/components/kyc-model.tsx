import { X, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KYCFormValues, kycSchema } from "../schemas/kyc.schema";
import { useSubmitKyc } from "../hooks/use-kyc";
import { toast } from "sonner";

interface KycModelProps {
  isOpen: boolean;
  onClose: () => void;
}

const KycModel = ({ isOpen, onClose }: KycModelProps) => {
  const { mutate: submitKyc, isPending } = useSubmitKyc();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<KYCFormValues>({
    resolver: zodResolver(kycSchema),
  });

  const onSubmit = (data: KYCFormValues) => {
    submitKyc(data, {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Complete KYC</h2>
          <button
            onClick={handleClose}
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <form id="kyc-form" onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto custom-scrollbar flex-1 flex flex-col">
          <div className="p-6">
            {/* Warning Banner */}
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800 items-start">
              <AlertCircle className="size-5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">For Employers Only</p>
                <p className="text-sm mt-1">
                  This verification process is strictly for Employers to verify their business identity. If you are a Job Seeker, you can safely ignore this step.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("companyName")}
                    type="text"
                    placeholder="Enter registered company name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
                </div>

                {/* Aadhar No */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Aadhar Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("aadharNo")}
                    type="text"
                    placeholder="12-digit Aadhar Number"
                    maxLength={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  {errors.aadharNo && <p className="text-xs text-red-500">{errors.aadharNo.message}</p>}
                </div>

                {/* GST Certificate */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    GST Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("gstNo")}
                    type="text"
                    placeholder="15-digit GSTIN"
                    maxLength={15}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  {errors.gstNo && <p className="text-xs text-red-500">{errors.gstNo.message}</p>}
                </div>

                {/* CIN Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    CIN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("cinNo")}
                    type="text"
                    placeholder="Corporate Identification Number"
                    maxLength={21}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  {errors.cinNo && <p className="text-xs text-red-500">{errors.cinNo.message}</p>}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mt-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Document Uploads</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* User Photo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">
                      Upload Photo <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors cursor-pointer bg-gray-50">
                      <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input {...register("photo")} type="file" className="sr-only" accept="image/*" />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                    {errors.photo && <p className="text-xs text-red-500">{errors.photo.message as string}</p>}
                  </div>

                  {/* Lightbill */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">
                      Upload Lightbill (Address Proof) <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors cursor-pointer bg-gray-50">
                      <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input {...register("lightbill")} type="file" className="sr-only" accept=".pdf,image/*" />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                    {errors.lightbill && <p className="text-xs text-red-500">{errors.lightbill.message as string}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4 rounded-b-xl shrink-0 mt-auto">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="kyc-form"
              disabled={isPending}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Submitting..." : "Submit KYC"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KycModel;