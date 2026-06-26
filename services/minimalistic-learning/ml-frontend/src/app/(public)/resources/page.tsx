import {
  FileText,
  PlayCircle,
  Download,
  ExternalLink,
  BookOpen,
  Layers,
  Lightbulb,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources Hub",
  description:
    "Explore our curated collection of books, guides, and tech tools designed for creators and learners.",
};

const resourceCategories = [
  {
    title: "Learning Guides",
    description:
      "Step-by-step PDF guides and roadmaps to master various technologies.",
    icon: FileText,
    items: [
      "Next.js Mastery",
      "Machine Learning Intro",
      "UI Design Principles",
    ],
  },
  {
    title: "Asset Library",
    description:
      "Curated collection of free icons, fonts, and UI components to accelerate your projects.",
    icon: Layers,
    items: ["Lucide Icons", "Google Fonts Pack", "Shadcn Components"],
  },
  {
    title: "Community Tools",
    description:
      "Useful browser extensions and developer tools built by our community.",
    icon: Lightbulb,
    items: [
      "Focus Mode Plugin",
      "Reading Speed Tracker",
      "Code Snippet Manager",
    ],
  },
];

const ResourcesHub = () => {
  return (
    <main className="flex-1 px-4 pt-16 pb-24 sm:px-6 lg:px-8">
      {/* Header Section */}
      <section className="mx-auto mt-12 mb-24 max-w-4xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold tracking-widest text-[#1877F2] uppercase">
          <Sparkles size={14} />
          Knowledge Base
        </div>
        <h1 className="mb-8 text-5xl leading-[1.1] font-black tracking-tighter text-gray-900 uppercase italic sm:text-6xl md:text-7xl">
          Resources <span className="text-[#1877F2]">Hub</span>
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed font-medium text-gray-500 md:text-xl">
          A curated collection of tools and materials to help you learn faster
          and build smarter.
        </p>
      </section>

      {/* Resources Grid */}
      <section className="mb-12 grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {resourceCategories.map((category, index) => (
          <div
            key={index}
            className="group rounded-[2rem] border border-gray-100 bg-white p-10 shadow-[0_8px_40px_rgba(0,0,0,0.02)] transition-all hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(24,119,242,0.1)]"
          >
            <div className="group- mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1877F2] transition-transform">
              <category.icon size={28} />
            </div>
            <h3 className="mb-4 text-2xl font-bold tracking-tight text-gray-900">
              {category.title}
            </h3>
            <p className="mb-8 min-h-[60px] text-sm leading-relaxed text-gray-500">
              {category.description}
            </p>
            <div className="space-y-3">
              {category.items.map((item, i) => (
                <div
                  key={i}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-transparent bg-gray-50/50 p-4 text-sm font-bold text-gray-700 transition-all hover:border-blue-100 hover:bg-blue-50 hover:text-[#1877F2]"
                >
                  {item}
                  <ArrowRightCircle size={16} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Explore Categories Banner */}
      <section className="mb-12 w-full">
        <div className="relative flex w-full flex-col items-center justify-between gap-12 overflow-hidden rounded-[3rem] bg-gray-900 p-12 text-white md:flex-row md:p-20">
          {/* Decorative background circle */}
          <div className="absolute top-[-50%] right-[-10%] h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[100px]" />

          <div className="relative z-10 max-w-lg">
            <h2 className="mb-6 text-4xl font-bold tracking-tight">
              Master New Skills Fast
            </h2>
            <p className="mb-8 text-lg leading-relaxed font-medium text-gray-400">
              Explore our categorized blog section where focused contributors
              share high-quality, long-form educational content.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-full bg-[#1877F2] px-8 py-3.5 font-bold text-white shadow-xl shadow-blue-500/20 transition-all"
            >
              Explore Blogs
              <ExternalLink size={18} />
            </Link>
          </div>
          <div className="relative z-10 flex max-w-md flex-wrap justify-center gap-4">
            {[
              "#Nextjs",
              "#Development",
              "#AI",
              "#Design",
              "#Business",
              "#Marketing",
            ].map((tag) => (
              <div
                key={tag}
                className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold backdrop-blur-sm transition-all hover:bg-white/10"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

const ArrowRightCircle = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m12 16 4-4-4-4"></path>
    <path d="M8 12h8"></path>
  </svg>
);

export default ResourcesHub;
