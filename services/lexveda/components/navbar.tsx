"use client"
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Practice Areas", href: "#practice-areas" },
    { label: "Consultation", href: "#consultation-form" },
    { label: "Services", href: "#services" },
    { label: "Why LexVeda", href: "#why-lexveda" },
    { label: "Contact Us", href: "#contact-us" }
  ];


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between h-14 sm:h-16 lg:h-16">
        <a href="/" className="flex items-center gap-2 sm:gap-3 py-1 flex-shrink-0">
          <Image 
            src="/LOGO.png" 
            alt="LexVeda Logo" 
            className="h-8 sm:h-10 w-auto object-contain"
            height={100}
            width={150}
          />
          <div className="flex flex-col items-center leading-none hidden sm:flex">
            <span className="font-serif text-lg sm:text-xl font-bold text-primary-foreground tracking-wider">
              Lex<span className="text-accent">Veda</span>
            </span>
            <div className="h-px w-full max-w-10 bg-linear-to-r from-transparent via-accent to-transparent my-1 hidden md:block" />
            <span className="text-[9px] sm:text-[10px] font-sans text-accent/80 tracking-tight hidden md:block text-center">
              Legal Services and Consultation
            </span>
          </div>
        </a>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {links.map((l) =>
          <a
            key={l.href}
            href={l.href}
            className="text-xs sm:text-sm font-sans font-medium text-primary-foreground/80 hover:text-accent transition-colors tracking-wide whitespace-nowrap">
            
              {l.label}
            </a>
          )}
          <Button variant="gold" size="sm" asChild>
            <a href="#request-form">Submit Request</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-primary-foreground p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open &&
      <div className="lg:hidden bg-primary border-t border-accent/20 px-4 sm:px-6 pb-4 sm:pb-6">
          {links.map((l) =>
        <a
          key={l.href}
          href={l.href}
          onClick={() => setOpen(false)}
          className="block py-2.5 sm:py-3 text-sm font-sans text-primary-foreground/80 hover:text-accent transition-colors">
          
              {l.label}
            </a>
        )}
          <Button variant="gold" size="sm" className="mt-3 sm:mt-4 w-full" asChild>
            <a href="#request-form">Submit Request</a>
          </Button>
        </div>
      }
    </nav>);

};

export default Navbar;