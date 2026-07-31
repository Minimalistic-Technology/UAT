"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Mail } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

/* ── Social Icons ── */
const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
const TwitterIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);
const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export const Footer = () => {
  return (
    <footer className="bg-theme-element-sec border-theme-accent/20 relative mt-auto w-full overflow-hidden border-t shadow-sm transition-colors duration-500">
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pt-16 pb-8 text-left sm:px-6 lg:px-8">
        {/* Main Grid Layout — 12 Columns */}
        <div className="mb-12 grid grid-cols-1 gap-y-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-6 xl:gap-x-12">
          {/* Col 1: Brand (Span 4) */}
          <div className="flex flex-col items-start lg:col-span-4">
            <Link href="/" className="group mb-5 flex items-center gap-3">
              <div className="border-theme-accent/20 group- flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border bg-white shadow-sm transition-transform">
                <Image
                  src="/logoML.png"
                  alt="ML Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-xl leading-none font-extrabold tracking-tight">
                  Minimalistic
                  <span className="text-theme-action">Learning</span>
                </span>
                <span className="text-foreground/50 mt-0.5 ml-0.5 text-[10px] font-semibold tracking-widest uppercase">
                  Platform
                </span>
              </div>
            </Link>

            <p className="text-foreground/70 mb-6 text-sm leading-relaxed font-medium">
              Empowering curious minds with high-quality, distraction-free
              educational resources since 2024.
            </p>

            <div className="text-foreground/60 flex items-center gap-4">
              <Link href="#" className="hover:text-theme-action transition-all">
                <FacebookIcon size={18} />
              </Link>
              <Link href="#" className="hover:text-theme-action transition-all">
                <TwitterIcon size={18} />
              </Link>
              <Link href="#" className="hover:text-theme-action transition-all">
                <LinkedinIcon size={18} />
              </Link>
            </div>
          </div>

          {/* Col 2: Quick Links (Span 2) */}
          <div className="flex flex-col lg:col-span-2">
            <h4 className="text-foreground mb-5 text-xs font-bold tracking-wider uppercase">
              Quick Links
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { name: "About Us", href: "/about" },
                { name: "Our Services", href: "/services" },
                { name: "Testimonials", href: "/testimonials" },
                { name: "Our Team", href: "/team" },
                { name: "Careers", href: "/careers" },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group text-foreground/70 hover:text-foreground flex w-fit items-center gap-2 text-sm font-medium transition-colors"
                >
                  <span className="bg-foreground h-px w-0 transition-all duration-300 group-hover:w-2" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Contact Us (Span 2) */}
          <div className="flex flex-col lg:col-span-2">
            <h4 className="text-foreground mb-5 text-xs font-bold tracking-wider uppercase">
              Contact Us
            </h4>
            <div className="flex flex-col gap-4">
              <div className="text-foreground/70 flex items-start gap-3 text-sm font-medium">
                <MapPin
                  size={16}
                  className="text-theme-action mt-0.5 shrink-0"
                />
                <span className="leading-relaxed">
                  123 Learning Avenue
                  <br />
                  Mumbai, MH 400001
                </span>
              </div>
              <div className="text-foreground/70 flex items-center gap-3 text-sm font-medium">
                <Mail size={16} className="text-theme-action shrink-0" />
                <span>info@minimalistic.edu</span>
              </div>
            </div>
          </div>

          {/* Col 5: Stay Updated (Span 4) */}
          <div className="flex flex-col lg:col-span-4 lg:pl-8">
            <h4 className="text-foreground mb-5 text-xs font-bold tracking-wider uppercase">
              Stay Updated
            </h4>
            <NewsletterForm />
            <p className="text-foreground/50 mt-4 text-xs font-medium">
              Subscribe for the latest educational resources.
            </p>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-theme-accent/10 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-foreground/60 text-xs font-semibold tracking-wide">
            © {new Date().getFullYear()} Minimalistic Learning. All rights
            reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              "Terms of Service",
              "Privacy Policy",
              "Cookie Policy",
              "Sitemap",
            ].map((legal) => (
              <Link
                key={legal}
                href="#"
                className="text-foreground/60 hover:text-foreground text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                {legal}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
