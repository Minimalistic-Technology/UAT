import { ArrowRight, BadgeCheck, Target, Eye, Layers, Printer, Scissors, BadgeCheck as Check } from 'lucide-react';
import { Reveal, SectionLabel } from '@/components/Reveal';
import { COMPANY, STATS, TIMELINE, PROCESS_STEPS } from '@/data/content';
import type { RoutePath } from '@/lib/router';

const FACTORY_IMG =
  'https://images.pexels.com/photos/14804699/pexels-photo-14804699.jpeg?auto=compress&cs=tinysrgb&h=900&w=1400';
const ABOUT_SLIDER = '/aboutslider.jpg';

const processIconMap: Record<string, typeof ArrowRight> = {
  Layers,
  Scissors,
  Printer,
  BadgeCheck: Check,
};

export function About({ navigate }: { navigate: (to: RoutePath) => void }) {
  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-ink-100 bg-ink-50/50">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <SectionLabel>About us</SectionLabel>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 text-balance sm:text-5xl">
              From a small-scale unit to one of India&apos;s finest tape makers
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-600 text-pretty">
              Over three decades of packaging experience, concentrated into dependable quality BOPP
              self-adhesive tape — marketed under the AASHOK brand since {COMPANY.established}.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-card">
                <div className="font-display text-4xl font-extrabold text-ink-900">
                  {s.value}
                  <span className="text-forest-600">{s.suffix}</span>
                </div>
                <div className="mt-2 text-xs font-medium uppercase tracking-wider text-ink-500">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <img
              src={ABOUT_SLIDER}
              alt="Sarvodaya manufacturing"
              className="w-full rounded-2xl border border-ink-100 shadow-lift"
            />
          </Reveal>
          <Reveal delay={120}>
            <SectionLabel>Our story</SectionLabel>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
              Built on three decades of packaging expertise
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-600">
              <p>
                {COMPANY.name} was established in {COMPANY.established} by Mr. Ashish Jhaveri, under
                the guidance of his father. Their well-planned progressive strategies and vast
                experience in packaging — corrugated boxes, release paper and self-adhesive
                solutions — helped the company carve a niche in a commendably short span of time.
              </p>
              <p>
                Today Sarvodaya is an {COMPANY.iso} company with an installed capacity of{' '}
                {COMPANY.capacity}, headquartered in Mumbai with manufacturing at Vapi, Gujarat —
                around 150 km from Mumbai and centrally located to serve wide transportation
                networks and distribution channels across India.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="border-y border-ink-100 bg-ink-50/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-ink-100 bg-white p-8 shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-ink-900">Our mission</h3>
                <p className="mt-3 text-base leading-relaxed text-ink-600">
                  100% customer satisfaction. Competitive pricing and dependable quality and service
                  on every roll — whether you need a customized packaging solution, a contract
                  manufacturing partner, or a distribution opportunity.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="h-full rounded-2xl border border-ink-100 bg-white p-8 shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-ink-900">Our vision</h3>
                <p className="mt-3 text-base leading-relaxed text-ink-600">
                  To remain one of India&apos;s finest and largest manufacturers and exporters of
                  BOPP self-adhesive tape — continuously improving quality, capacity and reach under
                  the AASHOK brand.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionLabel>Timeline</SectionLabel>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
            How we got here
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.title} delay={i * 80}>
              <div className="relative h-full rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
                <div className="font-display text-sm font-extrabold uppercase tracking-wider text-forest-600">
                  {t.year}
                </div>
                <h3 className="mt-2 font-display text-base font-bold text-ink-900">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{t.body}</p>
                {i < TIMELINE.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-ink-200 lg:block" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="border-y border-ink-100 bg-ink-50/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <SectionLabel>How we make it</SectionLabel>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
                From coating to dispatch, quality at every step
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-600">
                Every batch is checked for tensile strength, tackiness and weight before it ships —
                so what arrives on your line is what you specified.
              </p>
              <div className="mt-8 space-y-4">
                {PROCESS_STEPS.map((s, i) => {
                  const Icon = processIconMap[s.icon] ?? ArrowRight;
                  return (
                    <div key={s.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-600 text-white font-display text-sm font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-ink-900">{s.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-500">{s.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <img
                src={FACTORY_IMG}
                alt="Manufacturing floor"
                className="w-full rounded-2xl border border-ink-100 shadow-lift"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Certification band */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-forest-800 p-8 text-center text-white sm:p-12">
          <BadgeCheck className="h-10 w-10 text-forest-300" />
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {COMPANY.iso}
          </h2>
          <p className="max-w-xl text-ink-300">
            Quality management certified by TUV — a trusted manufacturer and exporter serving
            industries, e-commerce, FMCG and distributors across India and overseas.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="group mt-2 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lift transition hover:bg-brand-700"
          >
            Talk to us
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
