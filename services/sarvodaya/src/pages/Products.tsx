import { ArrowRight, Check } from 'lucide-react';
import { Reveal, SectionLabel } from '@/components/Reveal';
import { PRODUCTS, type Product } from '@/data/content';
import type { RoutePath } from '@/lib/router';

export function Products({ navigate }: { navigate: (to: RoutePath) => void }) {
  return (
    <div>
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-ink-100 bg-ink-50/50">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <SectionLabel>Products</SectionLabel>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink-900 text-balance sm:text-5xl">
              Every kind of BOPP self-adhesive tape, built to your spec
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-600 text-pretty">
              Various thicknesses, colours, plain or printed — in jumbo rolls of all widths and slit
              rolls as per your requirement. Six core product families, all under the AASHOK brand.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Product list */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-8 lg:space-y-12">
          {PRODUCTS.map((p, i) => (
            <ProductRow key={p.id} product={p} index={i} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink-100 bg-ink-50/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-card sm:p-12 lg:flex-row lg:justify-between lg:text-left">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 text-balance sm:text-3xl">
                Need a custom thickness, colour or width?
              </h2>
              <p className="mt-2 text-ink-600">
                We manufacture to your specification. Share your requirement and we&apos;ll take it
                from there.
              </p>
            </div>
            <button
              onClick={() => navigate('/contact')}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lift transition hover:bg-brand-700"
            >
              Request a quote
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductRow({
  product,
  index,
  navigate,
}: {
  product: Product;
  index: number;
  navigate: (to: RoutePath) => void;
}) {
  const reversed = index % 2 === 1;
  return (
    <Reveal>
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className={`overflow-hidden rounded-2xl border border-ink-100 shadow-card ${reversed ? 'lg:order-2' : ''}`}>
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-105"
          />
        </div>
        <div className={reversed ? 'lg:order-1' : ''}>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-600">
            {product.tagline}
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            {product.name}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-600 text-pretty">
            {product.description}
          </p>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {product.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-ink-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-600">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/contact')}
            className="group mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-ink-900 transition hover:gap-3"
          >
            Enquire about this tape
            <ArrowRight className="h-4 w-4 text-forest-600 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </Reveal>
  );
}
