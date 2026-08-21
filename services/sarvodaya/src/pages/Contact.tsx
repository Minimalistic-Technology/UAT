import { useState } from 'react';
import { Phone, Mail, MapPin, Building2, Factory, Send, CheckCircle2 } from 'lucide-react';
import { Reveal, SectionLabel } from '@/components/Reveal';
import { COMPANY, PRODUCTS } from '@/data/content';

export function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    product: '',
    message: '',
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-ink-100 bg-ink-50/50">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <SectionLabel>Contact</SectionLabel>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 text-balance sm:text-5xl">
              Drop us a message
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-600 text-pretty">
              Share your requirement — thickness, colour, width and length — and our team will get
              back to you. Sarvodaya is just an email away.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Quick contact cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Reveal>
            <a
              href={`tel:${COMPANY.marketingPhone.replace(/\s/g, '')}`}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600 transition group-hover:bg-forest-600 group-hover:text-white">
                <Phone className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-ink-400">Call us</span>
              <span className="font-display text-lg font-bold text-ink-900">{COMPANY.marketingPhone}</span>
              <span className="text-sm text-ink-500">Marketing — Darshit</span>
            </a>
          </Reveal>
          <Reveal delay={80}>
            <a
              href={`mailto:${COMPANY.email}`}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <Mail className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-ink-400">Email us</span>
              <span className="font-display text-lg font-bold text-ink-900">{COMPANY.email}</span>
              <span className="text-sm text-ink-500">We reply within one business day</span>
            </a>
          </Reveal>
          <Reveal delay={160}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-ink-400">Headquarters</span>
              <span className="font-display text-lg font-bold text-ink-900">Mumbai, Maharashtra</span>
              <span className="text-sm text-ink-500">Andheri East, Mumbai - 400 069</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Form + offices */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Form */}
          <Reveal>
            <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
              {sent ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="h-14 w-14 text-forest-500" />
                  <h2 className="mt-5 font-display text-2xl font-bold text-ink-900">Message received</h2>
                  <p className="mt-2 max-w-sm text-ink-500">
                    Thank you, {form.name || 'there'}. Our team will get back to you within one
                    business day. For urgent queries, call {COMPANY.marketingPhone}.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({ name: '', company: '', email: '', phone: '', product: '', message: '' });
                    }}
                    className="mt-6 text-sm font-bold text-forest-600 hover:text-forest-700"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900">
                    Send an enquiry
                  </h2>
                  <p className="mt-2 text-sm text-ink-500">
                    Fields marked with <span className="text-forest-600">*</span> are required.
                  </p>
                  <form onSubmit={onSubmit} className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Name" required>
                        <input
                          required
                          value={form.name}
                          onChange={update('name')}
                          className={inputCls}
                          placeholder="Your name"
                        />
                      </Field>
                      <Field label="Company">
                        <input
                          value={form.company}
                          onChange={update('company')}
                          className={inputCls}
                          placeholder="Company name"
                        />
                      </Field>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Email" required>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={update('email')}
                          className={inputCls}
                          placeholder="you@company.com"
                        />
                      </Field>
                      <Field label="Phone">
                        <input
                          value={form.phone}
                          onChange={update('phone')}
                          className={inputCls}
                          placeholder="+91 ..."
                        />
                      </Field>
                    </div>
                    <Field label="Product of interest">
                      <select value={form.product} onChange={update('product')} className={inputCls}>
                        <option value="">Select a product (optional)</option>
                        {PRODUCTS.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                        <option value="Other">Other / custom requirement</option>
                      </select>
                    </Field>
                    <Field label="Message" required>
                      <textarea
                        required
                        value={form.message}
                        onChange={update('message')}
                        rows={4}
                        className={inputCls}
                        placeholder="Tell us your thickness, colour, width and length requirement..."
                      />
                    </Field>
                    <button
                      type="submit"
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-600 px-6 py-3 text-sm font-bold text-white shadow-lift transition hover:bg-forest-700 sm:w-auto"
                    >
                      Send enquiry
                      <Send className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </Reveal>

          {/* Offices */}
          <Reveal delay={120}>
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900">
                Our offices
              </h2>
              {COMPANY.offices.map((o) => {
                const Icon = o.icon;
                return (
                  <div key={o.label} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="font-display text-base font-bold text-ink-900">{o.label}</div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-forest-600">
                          {o.role}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-ink-600">{o.address}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                      <span className="text-ink-500">{o.contact}</span>
                      <a
                        href={`tel:${o.phone.replace(/\s/g, '')}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-ink-900 hover:text-forest-600"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {o.phone}
                      </a>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-6">
                <div className="flex items-center gap-2 text-ink-900">
                  <Building2 className="h-4 w-4 text-forest-600" />
                  <span className="text-sm font-bold">Tel</span>
                </div>
                <p className="mt-1 text-sm text-ink-600">{COMPANY.tel}</p>
                <div className="mt-4 flex items-center gap-2 text-ink-900">
                  <Factory className="h-4 w-4 text-forest-600" />
                  <span className="text-sm font-bold">Production</span>
                </div>
                <p className="mt-1 text-sm text-ink-600">{COMPANY.productionPhone}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-ink-400 outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-100';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-500">
        {label} {required && <span className="text-forest-600">*</span>}
      </span>
      {children}
    </label>
  );
}
