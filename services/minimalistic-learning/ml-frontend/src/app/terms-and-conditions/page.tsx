import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Terms and Conditions | Minimalistic Learning",
    description: "Read our terms and conditions.",
};

const TermsAndConditionsPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-6 sm:px-12 lg:px-24">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link href="/" className="inline-flex items-center gap-2 text-theme-action font-bold hover:underline mb-4">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div className="space-y-4 border-b border-theme-accent/10 pb-8">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Terms and Conditions</h1>
                    <p className="text-foreground/60 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="prose prose-lg dark:prose-invert prose-headings:font-black prose-p:text-foreground/80 max-w-none">
                    <p className="font-bold mb-4">Last Updated: June 20, 2026</p>
                    <p className="mb-6">Website/Platform: <a href="https://minimalistic-learning.onrender.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-theme-action hover:underline">https://minimalistic-learning.onrender.com/</a></p>

                    <h3 className="font-black text-foreground mt-8 mb-2">1. Acceptance of Terms & Global Compliance</h3>
                    <p><strong>Binding Agreement:</strong> By accessing, signing up, or utilizing this website, you explicitly agree to comply with and be bound by these Terms and Conditions. If you disagree with any part, you must cease using our services immediately.</p>
                    <p><strong>Regulatory Compliance:</strong> This platform operates under global privacy framework guidelines, including the GDPR (General Data Protection Regulation) for UK/EU users, and the Digital Personal Data Protection (DPDP) Act / Information Technology Act for Indian users.</p>

                    <h3 className="font-black text-foreground mt-8 mb-2">2. User Accounts & Registration</h3>
                    <p><strong>Eligibility:</strong> Users must be at least 13 years of age (or 16 years within designated EU/UK jurisdictions) to establish an authorized account.</p>
                    <p><strong>Global Authentication:</strong> To serve a global audience, the registration process requires a valid international contact number accompanied by the respective country code.</p>
                    <p><strong>Account Security:</strong> Users maintain sole responsibility for safeguarding their login credentials. Any unauthorized activity under your account must be reported immediately.</p>

                    <h3 className="font-black text-foreground mt-8 mb-2">3. Data Privacy, Storage & User Rights</h3>
                    <p><strong>Data Processing:</strong> We securely collect minimal required identifiers (Username, Email Address, Contact Number, and IP Address) exclusively for operations and account maintenance.</p>
                    <p><strong>Data Protection & Encryption:</strong> All captured data is transmitted and stored securely using industrial-grade encryption standards. We do not sell raw user databases.</p>
                    <p><strong>Global Privacy Rights:</strong> Users retain absolute rights regarding data access, rectification, portability, and the Right to Erasure (Right to be Forgotten), allowing them to request permanent deletion of their account records at any time.</p>

                    <h3 className="font-black text-foreground mt-8 mb-2">4. Content Policy & Platform Integrity</h3>
                    <p><strong>Media Standards:</strong> Users managing or posting blogs are required to display or upload high-definition (HD) media. Uploading copyrighted, defamatory, or unlawful material is strictly forbidden.</p>
                    <p><strong>System Security:</strong> Any attempt to compromise platform integrity via malicious code injection, script execution, or Cross-Site Scripting (XSS) testing/attacks on any input vector is an absolute violation and will result in immediate termination.</p>

                    <h3 className="font-black text-foreground mt-8 mb-2">5. Disclaimer of Warranties & Analytics</h3>
                    <p><strong>Real-Time Data Accuracy:</strong> All statistical metrics, dashboard analytics, and platform views are extracted and populated in real-time. While we strive for system precision, we are not liable for temporary data-sync or hosting propagation delays.</p>
                    <p><strong>Limitation of Liability:</strong> The services are provided on an "as-is" and "as-available" basis without warranties of any kind.</p>

                    <h3 className="font-black text-foreground mt-8 mb-2">6. Dispute Resolution & Official Support</h3>
                    <p><strong>Governing Jurisdiction:</strong> These terms shall be governed by applicable international cyber laws and local statutory acts, without giving effect to conflict of law principles.</p>
                    <p><strong>Corporate Support Desk:</strong> For general compliance inquiries, technical reports, or data removal requests, users can reach the administration directly through our formalized helpline:</p>
                    <p><strong>Corporate Support Email:</strong> <a href="mailto:Minimalisticlearning2024@gmail.com" className="font-bold text-theme-action hover:underline">Minimalisticlearning2024@gmail.com</a></p>
                </div>
            </div>
        </div>
    );
}

export default TermsAndConditionsPage;
