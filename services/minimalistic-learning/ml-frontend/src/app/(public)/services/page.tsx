import {
  Code2,
  MonitorPlay,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
} from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Our Services" };

export default function ServicesPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full px-4 py-8 duration-700 sm:px-6 lg:px-8">
      {/* Header Area */}
      <div className="mx-auto mb-20 max-w-3xl text-center lg:mb-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-black tracking-widest text-emerald-500 uppercase shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Premium Offerings
        </div>
        <h1 className="text-foreground mb-8 text-4xl leading-[1.1] font-black tracking-tighter md:text-6xl lg:text-7xl">
          Services built for <br />
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            deep mastery.
          </span>
        </h1>
        <p className="text-foreground/70 text-lg leading-relaxed font-medium md:text-xl">
          We don't do superficial crash courses. Our services are engineered
          strictly for professionals who want to understand the engine, not just
          drive the car.
        </p>
      </div>

      {/* Core Services Bento Grid */}
      <div className="mb-20 grid grid-cols-1 gap-6 md:mb-12 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Feature / Span 2 */}
        <div className="group bg-theme-element border-theme-accent/20 relative overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-500 hover:border-emerald-500/50 md:p-12 lg:col-span-2">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px] transition-colors duration-700 group-hover:bg-emerald-500/10" />
          <div className="group- mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-lg shadow-emerald-500/20 transition-transform duration-500">
            <Code2 size={32} />
          </div>
          <h3 className="text-foreground mb-4 text-2xl font-black tracking-tight md:text-3xl">
            Elite Mentorship
          </h3>
          <p className="text-foreground/70 mb-8 max-w-xl text-base leading-relaxed font-medium md:text-lg">
            1-on-1 intensive code reviews, system design architecture planning,
            and personalized career roadmaps from industry veterans.
          </p>
          <ul className="mb-8 grid gap-4 sm:grid-cols-2">
            <li className="text-foreground/80 flex items-center gap-3 text-sm font-bold">
              <CheckIcon /> Full Stack Architecture
            </li>
            <li className="text-foreground/80 flex items-center gap-3 text-sm font-bold">
              <CheckIcon /> Advanced Code Reviews
            </li>
            <li className="text-foreground/80 flex items-center gap-3 text-sm font-bold">
              <CheckIcon /> Deployment CI/CD
            </li>
            <li className="text-foreground/80 flex items-center gap-3 text-sm font-bold">
              <CheckIcon /> Performance Tuning
            </li>
          </ul>
        </div>

        {/* Vertical Feature */}
        <div className="group bg-theme-element border-theme-accent/20 hover:border-theme-action/50 relative flex flex-col items-start justify-center overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-500 md:p-12">
          <div className="bg-theme-element-sec border-theme-accent/20 text-foreground group-hover:bg-theme-action mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:text-white">
            <MonitorPlay size={32} />
          </div>
          <h3 className="text-foreground mb-4 text-2xl font-black tracking-tight">
            Masterclasses
          </h3>
          <p className="text-foreground/70 mb-8 text-sm leading-relaxed font-medium md:text-base">
            Highly technical, deeply focused video masterclasses on exact,
            real-world problems. No fluff, just code.
          </p>
          <Link
            href="/courses"
            className="group/btn text-foreground hover:text-theme-action mt-auto flex items-center gap-2 text-sm font-black tracking-widest uppercase transition-colors"
          >
            Browse Catalog{" "}
            <ArrowRight
              size={16}
              className="transition-transform group-hover/btn:translate-x-1"
            />
          </Link>
        </div>

        {/* Smaller Card 1 */}
        <div className="group bg-theme-element border-theme-accent/20 hover:border-theme-action/50 rounded-[2.5rem] border p-8 transition-all duration-500">
          <Zap size={28} className="text-theme-action mb-6" />
          <h4 className="text-foreground mb-3 text-lg font-black">
            Enterprise Audits
          </h4>
          <p className="text-foreground/70 text-sm leading-relaxed font-medium">
            We review your company's codebase for security, scalability, and
            technical debt.
          </p>
        </div>

        {/* Smaller Card 2 */}
        <div className="group bg-theme-element border-theme-accent/20 hover:border-theme-action/50 rounded-[2.5rem] border p-8 transition-all duration-500">
          <Database size={28} className="text-theme-action mb-6" />
          <h4 className="text-foreground mb-3 text-lg font-black">
            Database Optimization
          </h4>
          <p className="text-foreground/70 text-sm leading-relaxed font-medium">
            Indexing strategies, query tuning, and schema re-designs for massive
            scale.
          </p>
        </div>

        {/* Smaller Card 3 */}
        <div className="group bg-theme-element border-theme-accent/20 hover:border-theme-action/50 rounded-[2.5rem] border p-8 transition-all duration-500">
          <ShieldCheck size={28} className="text-theme-action mb-6" />
          <h4 className="text-foreground mb-3 text-lg font-black">
            Security Hardening
          </h4>
          <p className="text-foreground/70 text-sm leading-relaxed font-medium">
            Penetration testing and vulnerability patches for sensitive API
            environments.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-foreground relative overflow-hidden rounded-[3rem] p-12 text-center md:p-20">
        <div className="to-background/20 absolute inset-0 bg-gradient-to-b from-transparent" />
        <Cpu size={48} className="text-background/80 mx-auto mb-6" />
        <h2 className="text-background relative z-10 mb-6 text-3xl font-black tracking-tighter md:text-5xl">
          Ready to build something serious?
        </h2>
        <p className="text-background/70 relative z-10 mx-auto mb-10 max-w-2xl text-lg font-medium">
          Contact us for enterprise solutions or intensive personal mentorship
          programs.
        </p>
        <Link
          href="#"
          className="bg-background text-foreground relative z-10 inline-flex items-center justify-center rounded-xl px-8 py-4 font-black shadow-2xl transition-transform"
        >
          Get in Touch
        </Link>
      </div>
    </div>
  );
}

const CheckIcon = () => (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  </span>
);
