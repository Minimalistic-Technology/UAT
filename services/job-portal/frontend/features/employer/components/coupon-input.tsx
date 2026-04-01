// features/employer/components/coupon-input.tsx
import { useState } from "react";
import { Tag, CheckCircle2, X } from "lucide-react";

export function CouponInput({ onApply, onRemove, appliedCoupon }: any) {
  const [code, setCode] = useState("");

  return (
    <div className="mt-6 p-4 bg-white border border-dashed border-gray-300 rounded-xl">
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Code {appliedCoupon} applied!
            </span>
          </div>
          <button onClick={() => { onRemove(); setCode(""); }} className="text-gray-400 hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Have a coupon?"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
          <button
            onClick={() => onApply(code)}
            disabled={!code}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}