"use client"
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Services", href: "#services" },
    { label: "Consultation", href: "#consultation-form" },
    { label: "Drafting", href: "#draft-form" },
    { label: "Why LexVeda", href: "#why-lexveda" }
  ];


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-accent/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-3 py-1">
          <Image 
            src="/LOGO.png" 
            alt="LexVeda Logo" 
            className="h-10 w-auto object-contain"
            height={100}
            width={150}
          />
          <div className="flex flex-col items-center leading-none">
            <span className="font-serif text-xl font-bold text-primary-foreground tracking-wider">
              Lex<span className="text-accent">Veda</span>
            </span>
            <div className="h-px w-full max-w-[40px] bg-linear-to-r from-transparent via-accent to-transparent my-1 hidden sm:block" />
            <span className="text-[10px] font-sans text-accent/80 tracking-tight hidden sm:block text-center">
              Legal Services and Consultation
            </span>
          </div>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) =>
          <a
            key={l.href}
            href={l.href}
            className="text-sm font-sans font-medium text-primary-foreground/80 hover:text-accent transition-colors tracking-wide">
            
              {l.label}
            </a>
          )}
          <Button variant="gold" size="sm" asChild>
            <a href="#request-form">Submit Request</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-primary-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open &&
      <div className="md:hidden bg-primary border-t border-accent/20 px-6 pb-4">
          {links.map((l) =>
        <a
          key={l.href}
          href={l.href}
          onClick={() => setOpen(false)}
          className="block py-3 text-sm font-sans text-primary-foreground/80 hover:text-accent transition-colors">
          
              {l.label}
            </a>
        )}
          <Button variant="gold" size="sm" className="mt-2 w-full" asChild>
            <a href="#request-form">Submit Request</a>
          </Button>
        </div>
      }
    </nav>);

};

export default Navbar;