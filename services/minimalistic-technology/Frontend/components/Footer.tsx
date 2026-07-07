"use client";

import React from "react";
import Link from "next/link";
import { Twitter, Linkedin, Instagram, ArrowUpRight } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="py-16 md:py-10 bg-background border-t border-white/5">
      <div className="max-w-[1280px] mx-auto px-[clamp(1.5rem,5vw,4rem)]">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black font-black text-xs">
                MT
              </div>
              <span className="text-[var(--text-main)] font-bold text-xl tracking-tight">
                Minimalistic{" "}
                <span className="bg-linear-to-tr from-primary to-primary/80 bg-clip-text text-transparent">
                  Technology
                </span>
              </span>
            </Link>
            <p className="text-dim opacity-70 leading-relaxed max-w-sm mb-8">
              Premium web design and development. From idea to live website in
              weeks.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Twitter, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Linkedin, href: "#" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-dim hover:text-primary hover:border-primary transition-all"
                >
                  <item.Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h5 className="text-white font-bold tracking-widest uppercase text-sm mb-6">
              Company
            </h5>
            <ul className="flex flex-col gap-4">
              {[
                ["About Us", "/about"],
                ["Our Team", "/team"],
                ["Services", "/services"],
                ["Templates", "/templates"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-dim hover:text-primary transition-colors flex items-center gap-2 group text-sm"
                  >
                    {label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h5 className="text-white font-bold tracking-widest uppercase text-sm mb-6">
              Services
            </h5>
            <ul className="flex flex-col gap-4">
              {[
                ["Web Design", "/services"],
                ["Development", "/services"],
                ["AI Builder", "/services"],
                ["UI/UX Design", "/services"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-dim hover:text-primary transition-colors flex items-center gap-2 group text-sm"
                  >
                    {label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-white font-bold tracking-widest uppercase text-sm mb-6">
              Contact
            </h5>
            <ul className="flex flex-col gap-4">
              <li>
                <a
                  href="mailto:hi@minimalistictechnology.com"
                  className="text-dim hover:text-primary transition-colors flex items-center gap-2 group text-sm"
                >
                  hi@minimalistictechnology.com
                </a>
              </li>
              <li>
                <Link
                  href="/#contact-form"
                  className="text-dim hover:text-primary transition-colors flex items-center gap-2 group text-sm"
                >
                  Get in Touch
                  <ArrowUpRight
                    size={12}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                  />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-center items-center gap-4">
          <span className="text-dim opacity-50 text-xs">
            © {new Date().getFullYear()} Minimalistic Technology. All rights
            reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
