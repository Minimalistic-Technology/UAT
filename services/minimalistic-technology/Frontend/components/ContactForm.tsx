'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Mail, ArrowRight, Hash, Rocket, Briefcase, DollarSign, Clock, ShieldCheck, User,  Phone} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';


interface FormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  websiteType: string;
  budget: string;
  timeline: string;
  projectDescription: string;
}

const initialFormState: FormData = {
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
  websiteType: '',
  budget: '',
  timeline: '',
  projectDescription: '',
};

const FieldWrapper = ({
  name,
  label,
  icon: Icon,
  activeField,
  children
}: {
  name: string,
  label: string,
  icon: any,
  activeField: string | null,
  children: React.ReactNode
}) => (
  <div className="group relative flex flex-col pt-4">
    <div className="flex items-center gap-2.5 mb-2 relative z-10 px-1">
      <Icon size={14} className={`transition-all duration-500 ${activeField === name ? 'text-primary scale-110' : 'text-[var(--text-dim)]/60'}`} />
      <label className="text-[0.65rem] font-bold text-[var(--text-dim)]/80 uppercase tracking-[0.15em] group-focus-within:text-primary transition-colors duration-300">
        {label}
      </label>
    </div>
    <div className="relative z-10 px-1">
      {children}
    </div>

    {/* Animated Focus Path */}
    <div className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-700 ease-out z-20 ${activeField === name ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
  </div>
);

const ContactForm: React.FC = () => {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const templateName = searchParams.get('templateName');
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => apiFetch('/api/send-mail', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      setShowSuccess(true);
      setFormData(initialFormState);
    },
    onError: (error) => {
      console.error('Error sending mail:', error);
      alert('Failed to send submission. Please try again later.');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const summary = `New contact form submission:\n\nName: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCompany: ${formData.companyName}\nFocus: ${formData.websiteType}\nBudget: ${formData.budget}\nTimeline: ${formData.timeline}\nDescription: ${formData.projectDescription}`;

    mutation.mutate({
      templateId: templateId || undefined,
      templateName,
      formData,
      text: summary,
      html: `<div style="font-family: sans-serif; line-height: 1.5;">${summary.replace(/\n/g, '<br>')}</div>`
    });
  };
  const inputClass = "bg-transparent border-0 border-b border-[var(--border-bright)] pb-4 pt-1 text-[var(--text-main)] text-lg font-medium transition-all duration-500 w-full focus:outline-none placeholder:text-[var(--text-dim)]/30 hover:border-primary/40 relative z-10";

  return (
    <section
      id="contact-form"
      className="py-30 relative bg-[var(--background)] overflow-hidden min-h-screen flex items-center justify-center"
    >
      {/* Cinematic Aurora Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-[20%] -left-[10%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[200px]"
        />
        <motion.div
          className="absolute -bottom-[20%] -right-[10%] w-[1000px] h-[1000px] bg-secondary/5 rounded-full blur-[250px]"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">

        {/* Elite Floating Hub */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={`relative max-w-5xl w-full bg-surface backdrop-blur-md rounded-[64px] border border-[var(--border)] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.05)] transition-all duration-1000 ${activeField ? 'border-primary/20 ring-1 ring-primary/10 shadow-[0_0_80px_rgba(var(--primary-rgb),0.05)]' : ''}`}
        >
          {/* Internal Glow Effects */}
          <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--text-main)]/[0.02] to-transparent pointer-events-none" />

          <div className="p-10 lg:p-20 flex flex-col items-center gap-16 lg:gap-12 relative z-10 w-full">

            {/* Hub Header Section */}
            <div className="w-full max-w-3xl flex flex-col items-center text-center">
              <h3 className="text-[3rem] lg:text-[4rem] font-bold text-[var(--text-main)] leading-[0.95] mb-6 tracking-[-0.04em]">
                Get Started <span className="bg-[linear-gradient(135deg,hsl(82,84%,50%),hsl(82,84%,35%))] bg-clip-text text-transparent">Today</span>
              </h3>

              <p className="text-[var(--text-dim)] text-lg leading-relaxed font-medium max-w-xl mb-10">
                Your vision, engineered. Share your project details and let’s build your digital presence
              </p>
            </div>

            {/* Hub Form Section */}
            <div className="w-full max-w-3xl bg-[var(--surface-hover)]/30 p-8 lg:p-14 rounded-[48px] border border-[var(--border)] backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex flex-col gap-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                  <FieldWrapper name="fullName" label="Full Name" icon={User} activeField={activeField}>
                    <input
                      required
                      type="text"
                      name="fullName"
                      placeholder="your name"
                      value={formData.fullName}
                      onChange={handleChange}
                      onFocus={() => setActiveField('fullName')}
                      onBlur={() => setActiveField(null)}
                      className={inputClass}
                    />
                  </FieldWrapper>

                  <FieldWrapper name="email" label="Email Address" icon={Mail} activeField={activeField}>
                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="mail@domain.io"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setActiveField('email')}
                      onBlur={() => setActiveField(null)}
                      className={inputClass}
                    />
                  </FieldWrapper>

                  <FieldWrapper name="companyName" label="Company / Entity" icon={Briefcase} activeField={activeField}>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="name of your brand"
                      value={formData.companyName}
                      onChange={handleChange}
                      onFocus={() => setActiveField('companyName')}
                      onBlur={() => setActiveField(null)}
                      className={inputClass}
                    />
                  </FieldWrapper>

                  <FieldWrapper name="phone" label="Contact Number" icon={Phone} activeField={activeField}>
                    <input
                      required
                      type="tel"
                      name="phone"
                      placeholder="+91 0000000000"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setActiveField('phone')}
                      onBlur={() => setActiveField(null)}
                      className={inputClass}
                    />
                  </FieldWrapper>

                  <FieldWrapper name="websiteType" label="Project Focus" icon={Rocket} activeField={activeField}>
                    <select
                      required
                      name="websiteType"
                      value={formData.websiteType}
                      onChange={handleChange}
                      onFocus={() => setActiveField('websiteType')}
                      onBlur={() => setActiveField(null)}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="" className="bg-[var(--surface)]">Select focus</option>
                      <option value="Architecture" className="bg-[var(--surface)]">High-End Architecture</option>
                      <option value="Economic" className="bg-[var(--surface)]">Economic Scaling</option>
                      <option value="Engine" className="bg-[var(--surface)]">Custom Logic Engine</option>
                      <option value="Neural" className="bg-[var(--surface)]">Neural UI/UX</option>
                    </select>
                  </FieldWrapper>

                  <div className="grid grid-cols-2 gap-6">
                    <FieldWrapper name="budget" label="Investment" icon={DollarSign} activeField={activeField}>
                      <select
                        required
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        onFocus={() => setActiveField('budget')}
                        onBlur={() => setActiveField(null)}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="" className="bg-[var(--surface)]">Range</option>
                        <option value="5k-10k" className="bg-[var(--surface)]">5k-10k</option>
                        <option value="10k-25k" className="bg-[var(--surface)]">10k-25k</option>
                        <option value="25k-50k" className="bg-[var(--surface)]">25k-50k</option>
                        <option value="50k+" className="bg-[var(--surface)]">50k+</option>
                      </select>
                    </FieldWrapper>

                    <FieldWrapper name="timeline" label="Timeline" icon={Clock} activeField={activeField}>
                      <select
                        required
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        onFocus={() => setActiveField('timeline')}
                        onBlur={() => setActiveField(null)}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="" className="bg-[var(--surface)]">Launch</option>
                        <option value="1-month" className="bg-[var(--surface)]">&lt; 1 Month</option>
                        <option value="3-months" className="bg-[var(--surface)]">3 Months</option>
                        <option value="6-months" className="bg-[var(--surface)]">6 Months</option>
                        <option value="flexible" className="bg-[var(--surface)]">Flexible</option>
                      </select>
                    </FieldWrapper>
                  </div>
                </div>

                <FieldWrapper name="projectDescription" label="Objective Briefing" icon={Rocket} activeField={activeField}>
                  <textarea
                    name="projectDescription"
                    placeholder="Specify your project goals and desired outcomes..."
                    value={formData.projectDescription}
                    onChange={handleChange}
                    onFocus={() => setActiveField('projectDescription')}
                    onBlur={() => setActiveField(null)}
                    rows={2}
                    className={`${inputClass} resize-none min-h-[90px] border-none`}
                  />
                </FieldWrapper>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="relative inline-flex items-center justify-center bg-primary text-black font-bold h-16 rounded-3xl w-full group overflow-hidden shadow-2xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-300"
                >
                  <AnimatePresence mode="wait">
                    {!mutation.isPending ? (
                      <motion.div
                        key="submit"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex items-center justify-center gap-3 w-full h-full font-bold text-lg tracking-tight"
                      >
                        Submit  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="submitting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-3 w-full h-full font-bold"
                      >
                        <span>Processing ...</span>
                        <Rocket size={20} className="animate-bounce" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </form>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Cinematic Success Morph */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-6 backdrop-blur-[60px] bg-[var(--background)]/80"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="bg-[var(--surface)] border border-[var(--border)] p-16 lg:p-24 rounded-[80px] max-w-3xl w-full text-center shadow-[0_0_150px_rgba(var(--primary-rgb),0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-primary/[0.03] pointer-events-none" />
              <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-12 border border-primary/20 shadow-glow relative z-10">
                <ShieldCheck size={48} className="animate-pulse" />
              </div>
              <h3 className="text-4xl lg:text-6xl font-bold text-[var(--text-main)] mb-8 tracking-[-0.05em] relative z-10">Sync Established</h3>
              <p className="text-[var(--text-dim)] text-xl opacity-80 mb-16 leading-relaxed max-w-md mx-auto relative z-10">
                Protocols verified. A senior logic architect will materialize at your digital coordinates shortly.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="relative inline-flex items-center justify-center px-12 py-5 bg-primary text-black font-bold h-16 rounded-2xl text-lg transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:shadow-[0_20px_40px_rgba(132,204,22,0.15)] hover:bg-[#9de02b] z-10 w-fit mx-auto"
              >
                Back to Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ContactForm;
