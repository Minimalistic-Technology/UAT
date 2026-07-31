"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  PhoneCall,
  Building2,
  Users2,
  Calendar,
} from "lucide-react";
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
      toast.error("Missing fields", {
        description: "Please provide your email, date, and time for the demo.",
      });
      return;
    }

    setIsBooking(true);
    try {
      await apiClient.post("/demo/book", {
        email: demoEmail,
        date: demoDate,
        time: demoTime,
        hiresPerYear: hiresPerYear[0],
      });
      toast.success("Demo Booked!", {
        description: "Check your email for the calendar invite.",
      });
    } catch (err: any) {
      toast.error("Booking Failed", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handlePostJob = () => {
    if (!session) {
      toast.error("Employer Account Required", {
        description:
          "Please log in with an employer account to post a job. If you don't have one, you can create it here.",
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
      className="bg-slate-50 py-24 md:py-32"
      data-testid="employer-cta-section"
    >
      <div className="mx-auto max-w-352 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeIn" }}
          className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50"
        >
          {/* Decorative Background Layers */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.15] mix-blend-multiply"
            style={{ backgroundImage: `url(${BG_URL})` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-linear-to-br from-white via-white/95 to-blue-50/30"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 [background-image:radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-12 p-8 md:p-16 lg:grid-cols-12 lg:p-20">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase md:text-xs">
                For Employers
              </span>
              <h2 className="mt-4 text-4xl leading-[1.1] font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                Hire people <br />
                who do the <span className="text-blue-600">work.</span>
              </h2>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl">
                Skip the 400-resume pile. Our matching engine surfaces the top
                2% of candidates for your role — with real portfolios, code
                samples, and work history.
              </p>

              <ul className="mt-10 space-y-4">
                {PERKS.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-center gap-3 font-semibold text-slate-900"
                  >
                    <CheckCircle2 size={22} className="text-primary shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-12 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={handlePostJob}
                  className="group shadow-primary/20 flex h-14 items-center gap-2 rounded-xl px-8 font-bold shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  data-testid="post-job-cta-button"
                >
                  Post a job — free
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="group hover:border-primary hover:text-primary flex h-14 items-center gap-2 rounded-xl border-2 px-8 font-bold transition-all duration-300"
                      data-testid="talk-to-sales-button"
                    >
                      <PhoneCall
                        size={18}
                        className="transition-transform group-hover:-translate-y-0.5"
                      />
                      Talk to sales
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="flex max-h-[90vh] w-[95vw] flex-col overflow-hidden rounded-2xl bg-slate-50 p-0 sm:max-w-2xl md:max-h-[85vh]">
                    <div className="scrollbar-hide grid flex-1 overflow-y-auto md:grid-cols-2">
                      {/* Interactive ROI Calculator */}
                      <div className="bg-white p-6 md:p-10">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
                            Let's talk numbers.
                          </DialogTitle>
                        </DialogHeader>
                        <p className="mt-2 mb-6 text-sm leading-relaxed text-slate-500 md:mb-8">
                          Traditional recruiters charge 15-20% per hire. See how
                          much you could save before we even get on a call.
                        </p>

                        <div className="space-y-6">
                          <div>
                            <div className="mb-4 flex justify-between">
                              <span className="text-sm font-bold text-slate-700">
                                Planned hires this year
                              </span>
                              <span className="text-primary bg-primary/10 rounded-md px-2 py-0.5 text-sm font-black">
                                {hiresPerYear[0]}
                              </span>
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

                          <div className="flex items-end justify-between border-t border-slate-100 pt-6">
                            <div>
                              <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                Estimated Savings
                              </div>
                              <div className="mt-1 text-3xl font-black text-emerald-500">
                                $
                                {((agencyCost - platformCost) / 1000).toFixed(
                                  0,
                                )}
                                k
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                vs Agencies
                              </div>
                              <div className="mt-1 text-sm font-bold text-slate-400 line-through decoration-red-400/50">
                                ${(agencyCost / 1000).toFixed(0)}k
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sales Contact CTA */}
                      <div className="relative flex flex-col justify-center overflow-hidden bg-slate-900 p-6 text-white md:p-10">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                          <TrendingDown size={140} />
                        </div>
                        <div className="relative z-10">
                          <div className="bg-primary/20 border-primary/30 mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border text-blue-400">
                            <Calendar size={24} />
                          </div>
                          <h3 className="mb-3 text-xl font-bold">
                            Enterprise Plans
                          </h3>
                          <p className="mb-6 text-sm leading-relaxed text-slate-400">
                            Ready to drastically reduce your cost-per-hire while
                            increasing candidate quality? Schedule a 15-minute
                            demo to see our sourcing engine in action.
                          </p>

                          <div className="mb-6 space-y-3">
                            <input
                              type="email"
                              placeholder="Your Work Email"
                              value={demoEmail}
                              onChange={(e) => setDemoEmail(e.target.value)}
                              className="bg-primary/10 border-primary/20 focus:border-primary/50 w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-blue-200/60 focus:outline-none"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="date"
                                value={demoDate}
                                onChange={(e) => setDemoDate(e.target.value)}
                                style={{ colorScheme: "dark" }}
                                className="bg-primary/10 border-primary/20 focus:border-primary/50 w-full rounded-xl border px-4 py-3 text-sm text-white focus:outline-none"
                              />
                              <input
                                type="time"
                                value={demoTime}
                                onChange={(e) => setDemoTime(e.target.value)}
                                style={{ colorScheme: "dark" }}
                                className="bg-primary/10 border-primary/20 focus:border-primary/50 w-full rounded-xl border px-4 py-3 text-sm text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <Button
                            disabled={isBooking}
                            onClick={handleBookDemo}
                            className="shadow-primary/20 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold shadow-xl transition-all"
                          >
                            {isBooking ? "Booking..." : "Book a Demo Call"}
                            {!isBooking && <ArrowRight size={16} />}
                          </Button>
                          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
                            <Building2 size={14} /> Prefer email? sales@
                            {APP_NAME}.com
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Right Card / Social Proof */}
            {/* <div className="lg:col-span-5">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative rounded-[2rem] bg-slate-950 p-10 text-white shadow-2xl shadow-slate-900/40"
              >
                // Status Indicator
                <div className="mb-8 flex items-center justify-between">
                  <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[10px] font-black tracking-widest text-blue-400 uppercase">
                    Verified Result
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    3 hires this hour
                  </div>
                </div>

                <blockquote className="text-2xl leading-snug font-medium tracking-tight italic md:text-3xl">
                  “We filled 3 senior roles in under 10 days.”
                </blockquote>

                <div className="mt-10 flex items-center gap-4 border-t border-slate-800 pt-8">
                  <div className="from-primary flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br to-blue-600 text-xl font-bold shadow-lg">
                    R
                  </div>
                  <div>
                    <div className="text-lg font-bold">Renu K.</div>
                    <div className="text-sm font-medium text-slate-500">
                      Head of People, Mercury
                    </div>
                  </div>
                </div>

                // Decorative corner element
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <CheckCircle2 size={120} />
                </div>
              </motion.div>
            </div> 
            */}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
