import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-20">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

      <header className="fixed top-0 inset-x-0 z-50 glassmorphism shadow-none border-b border-secondary/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">SmartShare</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
            <Link href="/register" className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 shadow-lg shadow-primary/20">Sign Up</Link>
          </div>
        </div>
      </header>

      <main className="flex-grow z-10 flex flex-col justify-center items-center px-4 pt-10 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
          Built for Sales & Admin Teams
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent mb-6">
          Share products securely, close deals faster.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          Curate specific product catalogs for your clients, generate secure trackable links, and get deep insights on client engagement.
        </p>

        <div className="flex gap-4 items-center">
          <Link href="/register" className="h-12 px-8 inline-flex items-center justify-center rounded-xl font-medium bg-primary text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all hover:scale-105">
            Get Started Free
          </Link>
          <Link href="/login" className="h-12 px-8 inline-flex items-center justify-center rounded-xl font-medium border border-secondary bg-background hover:bg-secondary/20 transition-all hover:scale-105">
            Access Dashboard
          </Link>
        </div>

        <div className="mt-20 w-full max-w-5xl glass-card rounded-2xl border border-secondary/50 shadow-2xl overflow-hidden">
          <div className="h-12 bg-secondary/30 border-b border-secondary/50 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          <div className="aspect-video bg-background/50 flex flex-col items-center justify-center p-8 text-muted-foreground">
            {/* Abstract representation of UI */}
            <div className="w-full max-w-3xl flex gap-6">
              <div className="w-1/4 space-y-4">
                <div className="h-8 bg-secondary/50 rounded animate-pulse"></div>
                <div className="h-4 bg-secondary/30 rounded w-2/3 animate-pulse"></div>
                <div className="h-4 bg-secondary/30 rounded w-3/4 animate-pulse"></div>
              </div>
              <div className="w-3/4 grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-secondary/20 rounded-xl border border-secondary/50 p-4 flex flex-col justify-end gap-2">
                    <div className="h-4 bg-secondary/40 rounded w-1/2"></div>
                    <div className="h-3 bg-secondary/20 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="z-10 py-8 text-center text-sm text-muted-foreground border-t border-secondary/30 mt-20">
        <p>&copy; {new Date().getFullYear()} SmartShare. All rights reserved.</p>
      </footer>
    </div>
  );
}
