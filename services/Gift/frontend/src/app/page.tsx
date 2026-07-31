import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Gift, Link2, ShieldCheck, BarChart3, Star, ArrowRight, Check } from "lucide-react";
import UserNavbar from "@/components/UserNavbar";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GIFT";

const features = [
  {
    icon: Gift,
    title: "Curate Gift Collections",
    description: "Select any combination of products from your catalog and bundle them into a personalised gift collection.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Link2,
    title: "Generate Secure Links",
    description: "Create a one-click shareable URL in seconds. Optional password protection and expiry dates included.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Assign Privately",
    description: "Assign gifts directly to a registered user. Only the assigned user will be able to see the collection in their profile.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: BarChart3,
    title: "Track Every View",
    description: "Know exactly when your recipient opened the link. Get real-time analytics on every share.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
];

const steps = [
  { step: "01", title: "Add your gifts", desc: "Upload product images and details to your private catalog." },
  { step: "02", title: "Select & Assign", desc: "Pick the gifts and assign them directly to your recipient's profile." },
  { step: "03", title: "Notify them", desc: "Tell your recipient to log into their private account dashboard." },
  { step: "04", title: "They unwrap it", desc: "They log in and discover the beautiful curated gift waiting for them." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      <UserNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(var(--primary-rgb),0.12),transparent)]" />
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            The smartest way to share gifts
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
            Share the perfect{" "}
            <span className="text-primary relative">
              gift
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10 Q150 2 298 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-40" />
              </svg>
            </span>
            {" "}collection
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Admin can curate personalised gift selections from their catalog, and assign them directly into the recipient's private user profile for them to discover.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 px-8">
                Start for free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8">
                Log In
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">No credit card required · Free forever for basic use</p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4">How it works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Four simple steps</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">From adding your first gift to sharing a beautiful curated link — it takes less than 2 minutes.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="relative group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all">
              <div className="text-4xl font-black text-primary/10 group-hover:text-primary/20 transition-colors mb-3">{step}</div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Built for personal gifting, brand campaigns, and everything in between.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div key={title} className="flex gap-5 p-6 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all">
              <div className={`mt-1 p-3 rounded-xl ${bg} h-fit flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <h3 className="font-semibold mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="relative rounded-3xl border border-primary/20 bg-primary/5 p-12 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.08),transparent_70%)]" />
          <Gift className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Ready to delight someone?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Create your first gift collection in minutes. For free.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-10 shadow-lg shadow-primary/20">
                Create your first gift link <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
            {["Free to start", "No credit card", "Setup in 2 min"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{APP_NAME}</span>
          </div>
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
