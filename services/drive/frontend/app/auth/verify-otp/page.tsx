import { Suspense } from "react";
import { VerifyOtpClient } from "@/features/auth/components";

const Page = () => {
  return (
    // useSearchParams() requires Suspense in App Router
    <Suspense>
      <VerifyOtpClient />
    </Suspense>
  );
};

export default Page;
