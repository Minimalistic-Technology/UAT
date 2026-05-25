import { Briefcase, ArrowRight, Code, PenTool, Terminal } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Careers" };

export default function CareersPage() {
    const jobs = [
        { title: "Senior Next.js Developer", type: "Full-Time", location: "Remote", icon: Code },
        { title: "Technical Writer & Reviewer", type: "Contract", location: "Remote", icon: PenTool },
        { title: "Go/Rust Systems Engineer", type: "Full-Time", location: "Hybrid", icon: Terminal },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-foreground tracking-tighter mb-6">Join <span className="text-purple-500">Us</span></h1>
                <p className="text-lg text-foreground/70 font-medium">Build the platform that developers actually respect. Work with a team obsessed with performance.</p>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8 px-4">
                    <Briefcase size={20} className="text-purple-500" />
                    <h2 className="text-lg font-black uppercase tracking-widest text-foreground">Open Positions</h2>
                </div>

                <div className="flex flex-col gap-4">
                    {jobs.map((job, i) => (
                        <div key={i} className="group flex flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 rounded-[1.5rem] bg-theme-element border border-theme-accent/10 hover:border-purple-500/30 transition-all duration-300">
                            <div className="flex items-center gap-5 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-theme-element-sec border border-theme-accent/20 flex items-center justify-center text-foreground/60 shadow-inner group-hover:text-purple-500 group-hover:scale-110 transition-all">
                                    <job.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground mb-1">{job.title}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/50">
                                        <span>{job.type}</span>
                                        <span className="w-1 h-1 rounded-full bg-foreground/20" />
                                        <span>{job.location}</span>
                                    </div>
                                </div>
                            </div>

                            <Link href="#" className="flex items-center justify-center gap-2 px-6 py-3 bg-background border border-theme-accent/20 rounded-xl text-sm font-black text-foreground hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all group/btn">
                                Apply Now
                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}

                    {jobs.length === 0 && (
                        <div className="p-12 text-center border-2 border-dashed border-theme-accent/20 rounded-[2rem]">
                            <p className="text-foreground/50 font-semibold">No open positions currently. Check back later!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
