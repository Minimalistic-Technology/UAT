"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "lexveda_terms_accepted";

export default function TermsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accepted = window.localStorage.getItem(STORAGE_KEY);

    if (true) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    // window.localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const handleReject = () => {
    window.localStorage.setItem(STORAGE_KEY, "false");
    window.location.reload();
  };

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
      <AlertDialogContent className="font-serif w-[92vw] max-w-lg md:max-w-2xl lg:max-w-3xl rounded-lg p-0 overflow-hidden">
        <AlertDialogHeader className="px-6 pt-6 pb-3 border-b">
          <AlertDialogTitle className="text-lg md:text-xl font-semibold">
            Terms & Agreement
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription className="px-6 py-4 max-h-[60vh] overflow-y-auto text-sm md:text-base leading-relaxed">
          <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-serif font-bold uppercase tracking-tight text-slate-900">
              Disclaimer & User Acknowledgement
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-700 font-sans">
              Compliance with Bar Council of India Rules
            </p>
          </div>

          <div className="space-y-6 text-md font-sans text-slate-600">
            <p>
              The{" "}
              <span className="font-bold text-slate-900">
                Bar Council of India rules
              </span>{" "}
              prohibit Advocates from advertising or soliciting work in any form
              or manner. By accessing the LexVeda website (
              <span className="italic text-blue-700">www.lexvedalegalservices.in</span>), the user
              acknowledges and agrees to the following:
            </p>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 decoration-slate-300 underline-offset-4">
                1. Nature of Content
              </h3>
              <p>
                This website is for{" "}
                <span className="font-medium text-slate-800">
                  informational purposes only
                </span>
                . It does not constitute solicitation, advertisement, or
                inducement.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Information provided does{" "}
                  <span className="font-semibold text-red-700">not</span> constitute legal
                  advice.
                </li>
                <li>
                  Accessing this site does{" "}
                  <span className="font-semibold text-red-700">not</span> create
                  an attorney-client relationship.
                </li>
                <li>
                  The user confirms they have voluntarily sought this
                  information for their own use.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
               <h3 className="font-bold text-slate-900 decoration-slate-300 underline-offset-4">
                2. Data Privacy and Consent
              </h3>
              <p className="text-md font-sans text-slate-700">
                We may collect personal details (names, contact info,
                qualifications) to assess internships, job opportunities, or
                inquiries. By sharing information, you consent to the
                collection, storage, and processing of your data in compliance
                with applicable laws.
              </p>
              <p className="text-[14px] italic">
                <span className="text-red-700 font-bold">* {" "}</span>Users confirm they have attained the age of majority in their
                jurisdiction.
              </p>
            </section>

            <div className="rounded-sm border-l-4 border-amber-500 bg-amber-50 p-3">
              <p className="text-sm font-bold text-amber-900">FRAUD ALERT:</p>
              <p className="text-sm text-amber-800">
                Lex Veda <span className="underline">does not</span> request
                payments for recruitment. Any such solicitation is fraudulent
                and should be ignored.
              </p>
            </div>

            <section className="pt-2 text-[13px] text-slate-500">
              <p>
                <span className="font-bold uppercase">
                  Intellectual Property:
                </span>{" "}
                All content is the exclusive property of Lex Veda. Unauthorized
                use or distribution is strictly prohibited.
              </p>
              <p className="mt-2">
                <span className="font-bold uppercase">Liability:</span> Lex Veda takes no responsibility for consequences arising from
                actions taken based on website content.
              </p>
            </section>
          </div>
        </AlertDialogDescription>

        {/* Footer */}
        <AlertDialogFooter className="px-6 py-4 mb-1 border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="w-full sm:w-auto hover:border-gold hover:bg-transparent cursor-pointer"
          >
            Reject
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={handleAccept}
            className="w-full sm:w-auto cursor-pointer"
          >
            Accept
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
