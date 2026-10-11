import { Suspense } from "react";
import CreateQuotationView from "../components/CreateQuotationView";

export default function CreateQuotationPage() {
    return (
        <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-slate-500">Loading quotation editor...</div>}>
            <CreateQuotationView />
        </Suspense>
    );
}
