"use client"
import { useState } from "react";
import emailjs from '@emailjs/browser';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Configuration for hidden backend details
const BACKEND_CONFIG = {
  whatsappNumber: "+917045882828",
  email: "info@lexvedalegalservices.in"
};

const SUCCESS_MESSAGE = "Your request has been successfully submitted. The LexVeda team will review your details and contact you shortly.";

export const ConsultationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.mobile || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Backend recording logic (Mock)
    const submission = {
      ...formData,
      id: Date.now().toString(),
      type: "consultation",
      date: new Date().toISOString(),
    };
    const existingRequests = JSON.parse(localStorage.getItem("consultation_requests") || "[]");
    localStorage.setItem("consultation_requests", JSON.stringify([...existingRequests, submission]));

    // WhatsApp redirection
    const message = `Hello LexVeda Team,\n\nI would like to book an online legal consultation.\n\nName: ${formData.fullName}\n\nMobile: ${formData.mobile}\n\nEmail: ${formData.email}\n\nLegal Issue: ${formData.description}\n\nPlease let me know the available consultation time.`;
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${BACKEND_CONFIG.whatsappNumber}&text=${encodedMessage}`;
    // const whatsappUrl = `https://wa.me/91${BACKEND_CONFIG.whatsappNumber}?text=${encodedMessage}`;

    // Show success toast and redirect
    toast.success(SUCCESS_MESSAGE);
    
    // Reset form
    setFormData({ fullName: "", email: "", mobile: "", description: "" });

    // Open WhatsApp after a brief delay
    setTimeout(() => {
      window.location.href = whatsappUrl;
      // window.open(whatsappUrl, "_blank");
    }, 1500);
  };

  return (
    <section id="consultation-form" className="section-padding bg-primary">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
            Online Legal Consultation
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-primary-foreground/70 font-sans">
            Provide your details to book a consultation via WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-sm border border-border p-8 space-y-6">
          <div>
            <Label htmlFor="consult-fullName" className="font-sans text-card-foreground">Full Name *</Label>
            <Input
              id="consult-fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="mt-1 font-sans"
              placeholder="Enter your full name" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="consult-email" className="font-sans text-card-foreground">Email *</Label>
              <Input
                id="consult-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 font-sans"
                placeholder="your@email.com" />
            </div>
            <div>
              <Label htmlFor="consult-mobile" className="font-sans text-card-foreground">Mobile Number *</Label>
              <Input
                id="consult-mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="mt-1 font-sans"
                placeholder="+91 XXXXXXXXXX" />
            </div>
          </div>

          <div>
            <Label htmlFor="consult-description" className="font-sans text-card-foreground">Brief Legal Issue *</Label>
            <Textarea
              id="consult-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 font-sans min-h-[120px]"
              placeholder="Describe your legal matter briefly..." />
          </div>

          <Button variant="gold" size="lg" type="submit" className="w-full text-base">
            Book Consultation
          </Button>
        </form>
      </div>
    </section>
  );
};

export const DraftRequestForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    caseDetails: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.mobile || !formData.caseDetails) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Backend recording logic (Mock)
    const submission = {
      ...formData,
      id: Date.now().toString(),
      type: "drafting",
      date: new Date().toISOString(),
    };
    const existingRequests = JSON.parse(localStorage.getItem("consultation_requests") || "[]");
    localStorage.setItem("consultation_requests", JSON.stringify([...existingRequests, submission]));

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS credentials are not configured in environment variables.");
      toast.error("Email configuration is missing. Please contact support.");
      return;
    }

    const toastId = toast.loading("Sending your request...");

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.fullName,
          from_email: formData.email,
          mobile: formData.mobile,
          message: formData.caseDetails,
          to_email: BACKEND_CONFIG.email,
        },
        publicKey
      );

      toast.success(SUCCESS_MESSAGE, { id: toastId });
      setFormData({ fullName: "", email: "", mobile: "", caseDetails: "" });
    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error("Failed to send your request. Please try again later.", { id: toastId });
    }
  };

  return (
    <section id="draft-form" className="section-padding bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 leading-relaxed">
            Submit Your Requests For Legal Services
          </h2>
          <div className="gold-divider mb-6" />
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-sm border border-border p-8 space-y-6 shadow-sm">
          <div>
            <Label htmlFor="draft-fullName" className="font-sans text-card-foreground">Full Name *</Label>
            <Input
              id="draft-fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="mt-1 font-sans"
              placeholder="Enter your full name" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="draft-email" className="font-sans text-card-foreground">Email *</Label>
              <Input
                id="draft-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 font-sans"
                placeholder="your@email.com" />
            </div>
            <div>
              <Label htmlFor="draft-mobile" className="font-sans text-card-foreground">Mobile Number *</Label>
              <Input
                id="draft-mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="mt-1 font-sans"
                placeholder="+91 XXXXXXXXXX" />
            </div>
          </div>

          <div>
            <Label htmlFor="draft-caseDetails" className="font-sans text-card-foreground">Case Details / Description *</Label>
            <Textarea
              id="draft-caseDetails"
              value={formData.caseDetails}
              onChange={(e) => setFormData({ ...formData, caseDetails: e.target.value })}
              className="mt-1 font-sans min-h-[120px]"
              placeholder="Describe your case details..." />
          </div>

          <Button variant="gold" size="lg" type="submit" className="w-full text-base">
            Submit
          </Button>
        </form>
      </div>
    </section>
  );
};

// Default export as a combined component or a placeholder
const RequestForm = () => {
  return (
    <>
      <ConsultationForm />
      <DraftRequestForm />
    </>
  );
};

export default RequestForm;
