import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Mail } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

/* ── Social Icons ── */
const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
const TwitterIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);
const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export const Footer = () => {
  return (
    <footer className="w-full bg-gray-950 mt-auto border-t border-gray-900 relative overflow-hidden">

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[150px] bg-[#1877F2]/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1400px] mx-auto px-5 lg:px-8 pt-12 pb-6 relative z-10 text-left">

        {/* Main Grid Layout — 12 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-10 lg:gap-x-6 xl:gap-x-10 mb-10">

          {/* Col 1: Brand (Span 3) */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-800 shadow-lg group-hover:scale-105 transition-transform">
                <Image src="/logoML.png" alt="ML Logo" width={32} height={32} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white leading-none mt-1">
                  Minimalistic<span className="text-[#1877F2]">Learning</span>
                </span>
              </div>
            </Link>

            <p className="text-gray-400 text-[13px] leading-relaxed mb-6 font-medium">
              Empowering curious minds with high-quality, distraction-free educational resources since 2024.
            </p>

            <div className="flex items-center gap-3 text-gray-500">
              <Link href="#" className="hover:text-white hover:scale-110 active:scale-95 transition-all"><FacebookIcon /></Link>
              <Link href="#" className="hover:text-white hover:scale-110 active:scale-95 transition-all"><TwitterIcon /></Link>
              <Link href="#" className="hover:text-white hover:scale-110 active:scale-95 transition-all"><LinkedinIcon /></Link>
            </div>
          </div>

          {/* Col 2: Quick Links (Span 2) */}
          <div className="lg:col-span-2 flex flex-col lg:pl-2">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-5">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Our Services', href: '/services' },
                { name: 'Testimonials', href: '/testimonials' },
                { name: 'Our Team', href: '/team' },
                { name: 'Careers', href: '/careers' },
              ].map(link => (
                <Link key={link.name} href={link.href} className="group flex items-center gap-2 text-gray-400 hover:text-white text-[13px] font-medium transition-colors w-fit">
                  <span className="w-0 h-px bg-white group-hover:w-2.5 transition-all duration-300" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Categories (Span 2) */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-5">Categories</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { name: 'Technology', href: '/blog?category=Technology' },
                { name: 'Software Dev', href: '/blog?category=Software+Dev' },
                { name: 'Machine Learning', href: '/blog?category=Machine+Learning' },
                { name: 'Design', href: '/blog?category=Design' },
                { name: 'Productivity', href: '/blog?category=Productivity' },
              ].map(link => (
                <Link key={link.name} href={link.href} className="group flex items-center gap-2 text-gray-400 hover:text-[#1877F2] text-[13px] font-medium transition-colors w-fit">
                  <span className="w-0 h-px bg-[#1877F2] group-hover:w-2.5 transition-all duration-300" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Contact Us (Span 2) */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-5">Contact Us</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-gray-400 text-[13px] font-medium">
                <MapPin size={16} className="text-[#1877F2] shrink-0 mt-0.5" />
                <span className="leading-snug">123 Learning Avenue<br />Mumbai, MH 400001</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-[13px] font-medium">
                <Mail size={16} className="text-[#1877F2] shrink-0" />
                <span>info@minimalistic.edu</span>
              </div>
            </div>
          </div>

          {/* Col 5: Stay Updated (Span 3) */}
          <div className="lg:col-span-3 flex flex-col">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-5">Stay Updated</h4>
            {/* Interactive newsletter form — client component */}
            <NewsletterForm />
            <p className="text-gray-500 text-[11px] font-medium leading-relaxed mt-3">
              Subscribe for the latest educational resources.
            </p>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-[12px] font-bold tracking-wide">
            © {new Date().getFullYear()} Minimalistic Learning. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Sitemap'].map((legal) => (
              <Link key={legal} href="#" className="text-gray-500 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors">
                {legal}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};
