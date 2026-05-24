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
  description: "Explore our curated collection of books, guides, and tech tools designed for creators and learners.",
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
    <main className="flex-1 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <section className="max-w-4xl mx-auto text-center mb-24 mt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-[#1877F2] text-xs font-bold mb-8 uppercase tracking-widest">
          <Sparkles size={14} />
          Knowledge Base
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[1.1] mb-8 italic uppercase italic">
          Resources <span className="text-[#1877F2]">Hub</span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12">
          A curated collection of tools and materials to help you learn faster
          and build smarter.
        </p>
      </section>

      {/* Resources Grid */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
        {resourceCategories.map((category, index) => (
          <div
            key={index}
            className="group bg-white rounded-[2rem] p-10 border border-gray-100 hover:border-blue-200 transition-all shadow-[0_8px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(24,119,242,0.1)] hover:-translate-y-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1877F2] mb-8 group-hover:scale-110 transition-transform">
              <category.icon size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              {category.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 min-h-[60px]">
              {category.description}
            </p>
            <div className="space-y-3">
              {category.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm font-bold text-gray-700 hover:text-[#1877F2] cursor-pointer p-4 rounded-2xl bg-gray-50/50 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
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
      <section className="max-w-7xl mx-auto mb-32">
        <div className="w-full rounded-[3rem] bg-gray-900 p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 text-white">
          {/* Decorative background circle */}
          <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-500/20 blur-[100px]" />

          <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl font-bold mb-6 tracking-tight">
              Master New Skills Fast
            </h2>
            <p className="text-gray-400 font-medium text-lg mb-8 leading-relaxed">
              Explore our categorized blog section where focused contributors
              share high-quality, long-form educational content.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#1877F2] text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
            >
              Explore Blogs
              <ExternalLink size={18} />
            </Link>
          </div>
          <div className="relative z-10 flex flex-wrap justify-center gap-4 max-w-md">
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
                className="px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-bold hover:bg-white/10 transition-all cursor-pointer"
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
