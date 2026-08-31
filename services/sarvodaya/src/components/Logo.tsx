export function Logo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <img
      src="/sarvodaya-logo.png"
      alt="Sarvodaya Industries logo"
      className={className}
      width={220}
      height={117}
    />
  );
}

export function AashokLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <img
      src="/aashok-logo.png"
      alt="Aashok Self Adhesive Tapes logo"
      className={className}
      width={220}
      height={117}
    />
  );
}
