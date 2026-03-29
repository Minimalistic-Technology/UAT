import { Suspense } from "react";
import VerifyOtpClient from "./verifyOtpClient";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <VerifyOtpClient />
    </Suspense>
  );
}
