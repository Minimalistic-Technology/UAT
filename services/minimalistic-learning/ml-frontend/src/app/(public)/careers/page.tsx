import { Briefcase, ArrowRight, Code, PenTool, Terminal } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Careers" };

export default function CareersPage() {
  const jobs = [
    {
      title: "Senior Next.js Developer",
      type: "Full-Time",
      location: "Remote",
      icon: Code,
    },
    {
      title: "Technical Writer & Reviewer",
      type: "Contract",
      location: "Remote",
      icon: PenTool,
    },
    {
      title: "Go/Rust Systems Engineer",
      type: "Full-Time",
      location: "Hybrid",
      icon: Terminal,
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full px-4 py-8 duration-700 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
        <h1 className="text-foreground mb-6 text-4xl font-black tracking-tighter md:text-5xl lg:text-7xl">
          Join <span className="text-purple-500">Us</span>
        </h1>
        <p className="text-foreground/70 text-lg font-medium">
          Build the platform that developers actually respect. Work with a team
          obsessed with performance.
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3 px-4">
          <Briefcase size={20} className="text-purple-500" />
          <h2 className="text-foreground text-lg font-black tracking-widest uppercase">
            Open Positions
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {jobs.map((job, i) => (
            <div
              key={i}
              className="group bg-theme-element border-theme-accent/10 flex flex-col justify-between rounded-[1.5rem] border p-6 transition-all duration-300 hover:border-purple-500/30 sm:p-8 md:flex-row md:items-center"
            >
              <div className="mb-4 flex items-center gap-5 md:mb-0">
                <div className="bg-theme-element-sec border-theme-accent/20 text-foreground/60 group- flex h-12 w-12 items-center justify-center rounded-xl border shadow-inner transition-all group-hover:text-purple-500">
                  <job.icon size={20} />
                </div>
                <div>
                  <h3 className="text-foreground mb-1 text-lg font-black">
                    {job.title}
                  </h3>
                  <div className="text-foreground/50 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                    <span>{job.type}</span>
                    <span className="bg-foreground/20 h-1 w-1 rounded-full" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>

              <Link
                href="#"
                className="bg-background border-theme-accent/20 text-foreground group/btn flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-black transition-all hover:border-purple-500 hover:bg-purple-500 hover:text-white"
              >
                Apply Now
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover/btn:translate-x-1"
                />
              </Link>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="border-theme-accent/20 rounded-[2rem] border-2 border-dashed p-12 text-center">
              <p className="text-foreground/50 font-semibold">
                No open positions currently. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
