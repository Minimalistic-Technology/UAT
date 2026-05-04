import React from "react";
import { BlogList } from "@/features/blog/components/blog-list";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/components/Hero";

const Home: React.FC = () => {
  return (
    <main className="flex-1 w-full relative">
      <Hero />
      {/* Content Section (Blog List) */}
      <section id="blog-list" className="w-full px-[5%] py-12">
        <div className="flex items-center justify-between gap-8 mb-16">
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
            <span className="text-[#1877F2]">Blogs</span> and articles
          </h1>
          <Link
            href="/blog"
            className="group flex items-center gap-2.5 px-6 py-3 bg-gray-900 text-white rounded-full font-bold text-xs sm:text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
          >
            View All Stories
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <BlogList limit={4} hideControls={true} />
      </section>
    </main>
  );
};

export default Home;