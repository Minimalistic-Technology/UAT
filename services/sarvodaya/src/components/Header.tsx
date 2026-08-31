import { Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';
import { Logo, AashokLogo } from './Logo';
import { NavLink, type RoutePath } from '@/lib/router';
import { COMPANY } from '@/data/content';

export function Header({
  current,
  navigate,
}: {
  current: RoutePath;
  navigate: (to: RoutePath) => void;
}) {
  const [open, setOpen] = useState(false);

  const go = (to: RoutePath) => {
    navigate(to);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => go('/')} className="flex items-center gap-3">
          <Logo className="h-9 w-auto" />
          <span className="hidden h-7 w-px bg-ink-200 sm:block" />
          <AashokLogo className="hidden h-7 w-auto sm:block" />
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" current={current} navigate={navigate}>
            Home
          </NavLink>
          <NavLink to="/products" current={current} navigate={navigate}>
            Products
          </NavLink>
          <NavLink to="/about" current={current} navigate={navigate}>
            About
          </NavLink>
          <NavLink to="/contact" current={current} navigate={navigate}>
            Contact
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={`tel:${COMPANY.marketingPhone.replace(/\s/g, '')}`}
            className="flex items-center gap-2 rounded-full bg-forest-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-700"
          >
            <Phone className="h-4 w-4" />
            Get a quote
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {([
              ['/', 'Home'],
              ['/products', 'Products'],
              ['/about', 'About'],
              ['/contact', 'Contact'],
            ] as [RoutePath, string][]).map(([to, label]) => (
              <button
                key={to}
                onClick={() => go(to)}
                className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                  current === to ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                }`}
              >
                {label}
              </button>
            ))}
            <a
              href={`tel:${COMPANY.marketingPhone.replace(/\s/g, '')}`}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-forest-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Phone className="h-4 w-4" />
              {COMPANY.marketingPhone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
