import { Sparkles, Shield, Zap, Globe, Heart, BookOpen } from "lucide-react";
import Link from "next/link";

const AboutPage = () => {
  return (
    <main className="flex-1 pt-16 pb-24">
      {/* About Hero Section */}
      <section className="relative px-[5%] mb-24 overflow-hidden">
        {/* Subtle Sky Background Effect */}
        <div
          className="absolute inset-0 z-0 opacity-50"
          style={{
            background: "linear-gradient(180deg, #A8CFFB 0%, transparent 100%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-[#1877F2] text-xs font-bold mb-8 uppercase tracking-widest">
            <Sparkles size={14} />
            Our Mission
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[1.1] mb-8">
            Pure Education,
            <br />
            <span className="text-[#1877F2]">Zero Distractions.</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12">
            At Minimalistic Learning, we believe the best way to master a skill
            is to remove the noise. Our platform is built for clarity, focus,
            and deep understanding.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="px-[5%] py-24 bg-white border-y border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                The Minimalist Philosophy
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Modern education platforms are often cluttered with
                advertisements, notifications, and irrelevant content. This
                "noise" creates mental fatigue and hinders the learning process.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    icon: Shield,
                    text: "Curated content protected from distractions.",
                  },
                  {
                    icon: Zap,
                    text: "Fast, performance-optimized learning paths.",
                  },
                  {
                    icon: Globe,
                    text: "Global community of focused learners.",
                  },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 text-gray-700 font-bold"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1877F2]">
                      <item.icon size={20} />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-tr from-[#A8CFFB] to-[#1877F2] overflow-hidden shadow-2xl shadow-blue-200">
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="w-full h-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white text-center p-8">
                    <BookOpen size={64} className="mb-6 opacity-80" />
                    <h3 className="text-2xl font-black mb-2 tracking-tight italic uppercase">
                      Focus Zone
                    </h3>
                    <p className="text-sm font-medium opacity-70 italic tracking-wider">
                      LEARN . CREATE . GROW
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-[5%] py-32 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter">
            Ready to start your journey?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/register"
              className="px-10 py-4 bg-[#1877F2] text-white rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-100"
            >
              Join Our Community
            </Link>
            <Link
              href="/blog"
              className="px-10 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              Explore Blogs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
