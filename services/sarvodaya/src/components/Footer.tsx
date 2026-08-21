import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { Logo, AashokLogo } from './Logo';
import { COMPANY, PRODUCTS } from '@/data/content';
import type { RoutePath } from '@/lib/router';

export function Footer({ navigate }: { navigate: (to: RoutePath) => void }) {
  return (
    <footer className="border-t border-ink-100 bg-ink-50/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex flex-wrap items-center gap-3">
              <Logo className="h-10 w-auto" />
              <span className="h-8 w-px bg-ink-200" />
              <AashokLogo className="h-8 w-auto" />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-500">
              ISO 9001:2015 TUV certified manufacturer and exporter of BOPP self-adhesive tapes.
              {COMPANY.tagline}.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400">Pages</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {([
                ['/', 'Home'],
                ['/products', 'Products'],
                ['/about', 'About'],
                ['/contact', 'Contact'],
              ] as [RoutePath, string][]).map(([to, label]) => (
                <li key={to}>
                  <button
                    onClick={() => navigate(to)}
                    className="text-ink-600 transition hover:text-ink-900"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400">Products</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {PRODUCTS.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => navigate('/products')}
                    className="text-left text-ink-600 transition hover:text-ink-900"
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                <span>{COMPANY.marketingPhone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-ink-900">
                  {COMPANY.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                <span>Andheri East, Mumbai - 400 069</span>
              </li>
            </ul>
            <button
              onClick={() => navigate('/contact')}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 transition hover:gap-2.5"
            >
              Contact us <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-200/70 pt-6 text-xs text-ink-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <p>{COMPANY.iso}</p>
        </div>
      </div>
    </footer>
  );
}
