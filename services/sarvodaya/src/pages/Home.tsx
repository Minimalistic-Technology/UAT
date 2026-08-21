import { useState, useEffect } from 'react';
import { ArrowRight, BadgeCheck, Factory, Truck, SlidersHorizontal, Handshake, Ship, ChevronLeft, ChevronRight } from 'lucide-react';
import { Reveal, SectionLabel } from '@/components/Reveal';
import { COMPANY, STATS, CAPABILITIES, PRODUCTS } from '@/data/content';
import type { RoutePath } from '@/lib/router';

const iconMap: Record<string, typeof ArrowRight> = {
  SlidersHorizontal,
  Handshake,
  Truck,
  Ship,
};

const HERO_SLIDES = [
  { src: '/h1m1.jpg', alt: 'Sticking to quality tapes' },
  { src: '/homeslidern2.jpg', alt: 'Sarvodaya quality tapes' },
  { src: '/homeslidern3.jpg', alt: 'Aashok self adhesive tapes' },
];

const WAREHOUSE_IMG =
  'https://images.pexels.com/photos/10834810/pexels-photo-10834810.jpeg?auto=compress&cs=tinysrgb&h=900&w=1400';

function HeroCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setIdx((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => setIdx((i) => (i + 1) % HERO_SLIDES.length);

  return (
    <div className="relative h-[420px] overflow-hidden sm:h-[520px] lg:h-[580px]">
      {HERO_SLIDES.map((s, i) => (
        <div
          key={s.src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          <img src={s.src} alt={s.alt} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-ink-950/40 to-transparent" />
        </div>
      ))}

      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-forest-300 backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5" />
            {COMPANY.iso}
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            India&apos;s dependable{' '}
            <span className="bg-gradient-to-r from-forest-400 to-forest-600 bg-clip-text text-transparent">
              BOPP self-adhesive
            </span>{' '}
            tape manufacturer
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-200 text-pretty sm:text-lg">
            Established in 2000 and marketed under the AASHOK brand — all kinds of BOPP tape, plain
            or printed, in jumbo and slit rolls built around your line.
          </p>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-2 rounded-full transition-all ${
              i === idx ? 'w-8 bg-forest-400' : 'w-2 bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function Home({ navigate }: { navigate: (to: RoutePath) => void }) {
  return (
    <div>
      {/* Hero carousel */}
      <HeroCarousel />

      {/* Stats bar */}
      <div className="bg-forest-700 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/15 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="px-2 py-6 text-center sm:px-6">
              <div className="font-display text-3xl font-extrabold">
                {s.value}
                <span className="text-forest-300">{s.suffix}</span>
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-forest-100">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who we are */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionLabel>Who we are</SectionLabel>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
              Three decades of packaging expertise, concentrated into one brand
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-600">
              <p>
                Established in 2000, <strong className="text-ink-900">{COMPANY.name}</strong> is an{' '}
                {COMPANY.iso} company and one of the largest manufacturers and exporters of BOPP
                self-adhesive tapes in India. Our products are marketed under the brand name{' '}
                <strong className="text-forest-700">{COMPANY.brand}</strong>.
              </p>
              <p>
                What began as a small-scale unit by Mr. Ashish Jhaveri, under the guidance of his
                father, has become one of the finest manufacturers in the country — built on
                progressive strategy and over three decades of experience in corrugated box
                packaging, release paper manufacturing and self-adhesive solutions.
              </p>
            </div>
            <button
              onClick={() => navigate('/about')}
              className="group mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-ink-900 transition hover:gap-3"
            >
              Read our story
              <ArrowRight className="h-4 w-4 text-forest-600 transition group-hover:translate-x-0.5" />
            </button>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-lift">
                <img src="/aboutslider.jpg" alt="Sarvodaya manufacturing" className="aspect-[4/3] w-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden w-56 rounded-xl border border-ink-100 bg-white p-5 shadow-card sm:block">
                <Factory className="h-6 w-6 text-forest-600" />
                <div className="mt-2 font-display text-sm font-bold text-ink-900">
                  Vapi, Gujarat plant
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">
                  150 km from Mumbai, centrally located for nationwide distribution.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What we do / capabilities */}
      <section className="border-y border-ink-100 bg-ink-50/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <Reveal>
              <SectionLabel>What we do</SectionLabel>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
                A partner for packaging, contract manufacturing and distribution
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-600">
                Whether you need a customized packaging solution, a reliable contract manufacturing
                partner, or an opportunity to distribute our products, Sarvodaya is just an email
                away.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((c, i) => {
              const Icon = iconMap[c.icon] ?? ArrowRight;
              return (
                <Reveal key={c.title} delay={i * 80}>
                  <div className="group h-full rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600 transition group-hover:bg-forest-600 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-display text-base font-bold text-ink-900">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">{c.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products preview */}
      <ProductsPreview navigate={navigate} />

      {/* CTA band */}
      <section className="relative overflow-hidden bg-brand-700 text-white">
        <img src={WAREHOUSE_IMG} alt="Warehouse" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-800 to-brand-700/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <Reveal className="max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Looking for a customized packaging solution?
              </h2>
              <p className="mt-3 text-base leading-relaxed text-brand-100">
                Tell us your thickness, colour, width and length — we&apos;ll build the tape around
                your line. Sarvodaya is just an email away.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <button
                onClick={() => navigate('/contact')}
                className="group inline-flex items-center gap-2 rounded-full bg-forest-500 px-6 py-3 text-sm font-bold text-white shadow-lift transition hover:bg-forest-600"
              >
                Start a conversation
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductsPreview({ navigate }: { navigate: (to: RoutePath) => void }) {
  const ids = ['industrial-packing-tapes', 'jumbo-rolls', 'stationary-tapes', 'no-noise-tapes'];
  const items = ids.map((id) => PRODUCTS.find((p) => p.id === id)!);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Reveal>
          <SectionLabel>Products</SectionLabel>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
            Built for every kind of line
          </h2>
        </Reveal>
        <button
          onClick={() => navigate('/products')}
          className="group inline-flex items-center gap-1.5 text-sm font-bold text-ink-900 transition hover:gap-3"
        >
          View all products
          <ArrowRight className="h-4 w-4 text-forest-600 transition group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={i * 80}>
            <button
              onClick={() => navigate('/products')}
              className="group block h-full overflow-hidden rounded-2xl border border-ink-100 bg-white text-left shadow-card transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="aspect-[4/3] overflow-hidden bg-ink-100">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-forest-600">
                  {p.tagline}
                </div>
                <h3 className="mt-1.5 font-display text-base font-bold text-ink-900">{p.name}</h3>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
