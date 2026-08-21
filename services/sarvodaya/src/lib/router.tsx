import { useEffect, useState, useCallback } from 'react';

export type RoutePath = '/' | '/products' | '/about' | '/contact';

function parseHash(): RoutePath {
  const hash = window.location.hash.replace(/^#/, '');
  const valid: RoutePath[] = ['/', '/products', '/about', '/contact'];
  return (valid as string[]).includes(hash) ? (hash as RoutePath) : '/';
}

export function useRouter() {
  const [path, setPath] = useState<RoutePath>(parseHash());

  useEffect(() => {
    const onChange = () => {
      setPath(parseHash());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: RoutePath) => {
    window.location.hash = to;
  }, []);

  return { path, navigate };
}

export function NavLink({
  to,
  current,
  navigate,
  children,
}: {
  to: RoutePath;
  current: RoutePath;
  navigate: (to: RoutePath) => void;
  children: React.ReactNode;
}) {
  const active = current === to;
  return (
    <button
      onClick={() => navigate(to)}
      className={`relative px-1 py-2 text-sm font-medium transition-colors ${
        active ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-px left-0 h-0.5 bg-brand-500 transition-all duration-300 ${
          active ? 'w-full' : 'w-0'
        }`}
      />
    </button>
  );
}
