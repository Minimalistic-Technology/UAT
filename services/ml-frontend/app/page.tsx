import React from 'react';
import { BlogList } from '@/features/blog/components/blog-list';
import { Navbar } from '@/components/Navbar';
import { ArrowRight, Sparkles, Globe, Zap, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF] transition-colors duration-500">
      {/* Navbar */}
      <Navbar />

      <main className="flex-1 w-full relative pt-20 sm:pt-28">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-gray-50 to-transparent -z-10" />

        {/* Content Section (Blog List) */}
        <section id="blog-list" className="w-full px-[5%] py-12">
          <div className="flex items-center justify-between gap-8 mb-16">
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
              Blog and articles
            </h1>
          </div>

          <BlogList />
        </section>

        <footer className="w-full py-20 bg-white border-t border-gray-100 mt-32 px-[5%]">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white mb-8 shadow-2xl shadow-gray-200">
              <BookOpen size={24} />
            </div>
            <p className="text-gray-900 font-black text-sm tracking-tight mb-3">
              Minimalistic<span className="text-[#1877F2]">Learning</span>
            </p>
            <p className="text-gray-400 text-xs sm:text-sm max-w-sm leading-relaxed font-medium">
              &copy; {new Date().getFullYear()} - All Rights Reserved. <br />
              Designed for clarity, built for learners everywhere.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;