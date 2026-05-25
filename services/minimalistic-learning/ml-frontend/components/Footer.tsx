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
    <footer className="w-full bg-theme-element-sec mt-auto border-t border-theme-accent/20 relative overflow-hidden transition-colors duration-500 shadow-sm">

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10 text-left">

        {/* Main Grid Layout — 12 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-12 lg:gap-x-6 xl:gap-x-12 mb-12">

          {/* Col 1: Brand (Span 4) */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-theme-accent/20 flex items-center justify-center bg-white group-hover:scale-105 transition-transform">
                <Image src="/logoML.png" alt="ML Logo" width={40} height={40} className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-foreground leading-none">
                  Minimalistic<span className="text-theme-action">Learning</span>
                </span>
                <span className="text-[10px] font-semibold text-foreground/50 tracking-widest uppercase mt-0.5 ml-0.5">
                  Platform
                </span>
              </div>
            </Link>

            <p className="text-foreground/70 text-sm leading-relaxed mb-6 font-medium">
              Empowering curious minds with high-quality, distraction-free educational resources since 2024.
            </p>

            <div className="flex items-center gap-4 text-foreground/60">
              <Link href="#" className="hover:text-theme-action hover:scale-110 active:scale-95 transition-all"><FacebookIcon size={18} /></Link>
              <Link href="#" className="hover:text-theme-action hover:scale-110 active:scale-95 transition-all"><TwitterIcon size={18} /></Link>
              <Link href="#" className="hover:text-theme-action hover:scale-110 active:scale-95 transition-all"><LinkedinIcon size={18} /></Link>
            </div>
          </div>

          {/* Col 2: Quick Links (Span 2) */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="text-foreground font-bold uppercase tracking-wider text-xs mb-5">Quick Links</h4>
            <div className="flex flex-col gap-3">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Our Services', href: '/services' },
                { name: 'Testimonials', href: '/testimonials' },
                { name: 'Our Team', href: '/team' },
                { name: 'Careers', href: '/careers' },
              ].map(link => (
                <Link key={link.name} href={link.href} className="group flex items-center gap-2 text-foreground/70 hover:text-foreground text-sm font-medium transition-colors w-fit">
                  <span className="w-0 h-px bg-foreground group-hover:w-2 transition-all duration-300" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Contact Us (Span 2) */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="text-foreground font-bold uppercase tracking-wider text-xs mb-5">Contact Us</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-foreground/70 text-sm font-medium">
                <MapPin size={16} className="text-theme-action shrink-0 mt-0.5" />
                <span className="leading-relaxed">123 Learning Avenue<br />Mumbai, MH 400001</span>
              </div>
              <div className="flex items-center gap-3 text-foreground/70 text-sm font-medium">
                <Mail size={16} className="text-theme-action shrink-0" />
                <span>info@minimalistic.edu</span>
              </div>
            </div>
          </div>

          {/* Col 5: Stay Updated (Span 4) */}
          <div className="lg:col-span-4 flex flex-col lg:pl-8">
            <h4 className="text-foreground font-bold uppercase tracking-wider text-xs mb-5">Stay Updated</h4>
            <NewsletterForm />
            <p className="text-foreground/50 text-xs font-medium mt-4">
              Subscribe for the latest educational resources.
            </p>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-theme-accent/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground/60 text-xs font-semibold tracking-wide">
            © {new Date().getFullYear()} Minimalistic Learning. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Sitemap'].map((legal) => (
              <Link key={legal} href="#" className="text-foreground/60 hover:text-foreground text-xs font-semibold uppercase tracking-wider transition-colors">
                {legal}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};
