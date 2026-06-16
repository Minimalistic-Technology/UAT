"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2, TrendingDown, PhoneCall, Building2, Users2, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

import { APP_NAME } from "@/constants";
import { PERKS } from "../config";
import { Button } from "@/components/ui/button";

const BG_URL =
  "https://static.prod-images.emergentagent.com/jobs/87777c5c-7e2c-4061-8282-ba379018b5d9/images/d502f0b7342dfdd8180285c187d04afae3a471f4d2c6560b7c4943fac5d7492d.png";

export const EmployerCTA = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [hiresPerYear, setHiresPerYear] = useState<number[]>([10]);
  const [demoEmail, setDemoEmail] = useState("");
  const [demoDate, setDemoDate] = useState("");
  const [demoTime, setDemoTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      setDemoEmail(session.user.email);
    }
  }, [session]);

  const handleBookDemo = async () => {
    if (!demoEmail || !demoDate || !demoTime) {
      toast.error("Missing fields", { description: "Please provide your email, date, and time for the demo." });
      return;
    }

    setIsBooking(true);
    try {
      await apiClient.post("/demo/book", {
        email: demoEmail,
        date: demoDate,
        time: demoTime,
        hiresPerYear: hiresPerYear[0]
      });
      toast.success("Demo Booked!", { description: "Check your email for the calendar invite." });
    } catch (err: any) {
      toast.error("Booking Failed", { description: err.response?.data?.message || err.message });
    } finally {
      setIsBooking(false);
    }
  };

  const handlePostJob = () => {
    if (!session) {
      toast.error("Employer Account Required", {
        description: "Please log in with an employer account to post a job. If you don't have one, you can create it here.",
        action: {
          label: "Register",
          onClick: () => router.push("/employer-register"),
        },
      });
      return;
    }
    router.push("/employer-dashboard/listings/create");
  };

  const agencyCost = hiresPerYear[0] * 15000;
  const platformCost = hiresPerYear[0] * 500; // Fake number for demonstration

  return (
    <section
      id="employers"
      className="py-24 md:py-32 bg-slate-50"
      data-testid="employer-cta-section"
    >
      <div className="max-w-352 mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeIn" }}
          className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-200/50"
        >
          {/* Decorative Background Layers */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.15] mix-blend-multiply"
            style={{ backgroundImage: `url(${BG_URL})` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-linear-to-br from-white via-white/95 to-blue-50/30" aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden="true" />

          <div className="relative grid lg:grid-cols-12 gap-12 p-8 md:p-16 lg:p-20 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-black text-blue-600">
                For Employers
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl mt-4 text-slate-900 font-bold leading-[1.1] tracking-tight">
                Hire people <br />
                who do the <span className="text-blue-600">work.</span>
              </h2>
              <p className="mt-8 text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                Skip the 400-resume pile. Our matching engine surfaces the top
                2% of candidates for your role — with real portfolios, code
                samples, and work history.
              </p>

              <ul className="mt-10 space-y-4">
                {PERKS.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-center gap-3 text-slate-900 font-semibold"
                  >
                    <CheckCircle2
                      size={22}
                      className="text-primary shrink-0"
                    />
                    {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-12 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={handlePostJob}
                  className="group px-8 h-14 font-bold transition-all duration-300 shadow-xl shadow-primary/20 hover:-translate-y-0.5 flex items-center gap-2 rounded-xl"
                  data-testid="post-job-cta-button"
                >
                  Post a job — free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="group px-8 h-14 font-bold transition-all duration-300 flex items-center gap-2 rounded-xl border-2 hover:border-primary hover:text-primary"
                      data-testid="talk-to-sales-button"
                    >
                      <PhoneCall size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                      Talk to sales
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] md:max-h-[85vh] p-0 overflow-hidden bg-slate-50 rounded-2xl flex flex-col">
                    <div className="grid md:grid-cols-2 flex-1 overflow-y-auto scrollbar-hide">
                      {/* Interactive ROI Calculator */}
                      <div className="p-6 md:p-10 bg-white">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
                            Let's talk numbers.
                          </DialogTitle>
                        </DialogHeader>
                        <p className="text-slate-500 mt-2 text-sm leading-relaxed mb-6 md:mb-8">
                          Traditional recruiters charge 15-20% per hire. See how much you could save before we even get on a call.
                        </p>

                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between mb-4">
                              <span className="text-sm font-bold text-slate-700">Planned hires this year</span>
                              <span className="text-sm font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">{hiresPerYear[0]}</span>
                            </div>
                            <Slider
                              defaultValue={[10]}
                              max={100}
                              min={1}
                              step={1}
                              onValueChange={setHiresPerYear}
                              className="w-full"
                            />
                          </div>

                          <div className="pt-6 border-t border-slate-100 flex items-end justify-between">
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Savings</div>
                              <div className="text-3xl font-black text-emerald-500 mt-1">
                                ${((agencyCost - platformCost) / 1000).toFixed(0)}k
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">vs Agencies</div>
                              <div className="text-sm font-bold text-slate-400 line-through decoration-red-400/50 mt-1">
                                ${(agencyCost / 1000).toFixed(0)}k
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sales Contact CTA */}
                      <div className="bg-slate-900 p-6 md:p-10 text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                          <TrendingDown size={140} />
                        </div>
                        <div className="relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-blue-400 flex items-center justify-center mb-6 border border-primary/30">
                            <Calendar size={24} />
                          </div>
                          <h3 className="text-xl font-bold mb-3">Enterprise Plans</h3>
                          <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Ready to drastically reduce your cost-per-hire while increasing candidate quality? Schedule a 15-minute demo to see our sourcing engine in action.
                          </p>

                          <div className="space-y-3 mb-6">
                            <input
                              type="email"
                              placeholder="Your Work Email"
                              value={demoEmail}
                              onChange={(e) => setDemoEmail(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-white placeholder-blue-200/60 focus:outline-none focus:border-primary/50 text-sm"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="date"
                                value={demoDate}
                                onChange={(e) => setDemoDate(e.target.value)}
                                style={{ colorScheme: "dark" }}
                                className="w-full px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-white focus:outline-none focus:border-primary/50 text-sm"
                              />
                              <input
                                type="time"
                                value={demoTime}
                                onChange={(e) => setDemoTime(e.target.value)}
                                style={{ colorScheme: "dark" }}
                                className="w-full px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-white focus:outline-none focus:border-primary/50 text-sm"
                              />
                            </div>
                          </div>

                          <Button
                            disabled={isBooking}
                            onClick={handleBookDemo}
                            className="w-full h-12 font-bold transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 rounded-xl"
                          >
                            {isBooking ? "Booking..." : "Book a Demo Call"}
                            {!isBooking && <ArrowRight size={16} />}
                          </Button>
                          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
                            <Building2 size={14} /> Prefer email? sales@{APP_NAME}.com
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Right Card / Social Proof */}
            <div className="lg:col-span-5">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-slate-950 rounded-[2rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative"
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-8">
                  <div className="px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[10px] font-black tracking-widest uppercase text-blue-400">
                    Verified Result
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    3 hires this hour
                  </div>
                </div>

                <blockquote className="text-2xl md:text-3xl font-medium leading-snug tracking-tight italic">
                  “We filled 3 senior roles in under 10 days.”
                </blockquote>

                <div className="mt-10 pt-8 border-t border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center font-bold text-xl shadow-lg">
                    R
                  </div>
                  <div>
                    <div className="font-bold text-lg">Renu K.</div>
                    <div className="text-sm font-medium text-slate-500">
                      Head of People, Mercury
                    </div>
                  </div>
                </div>

                {/* Decorative corner element */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <CheckCircle2 size={120} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};