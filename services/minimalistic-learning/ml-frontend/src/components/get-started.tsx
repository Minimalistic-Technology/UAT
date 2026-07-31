"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const GetStartedBtn = () => {
  return (
    <Link
      href="/login"
      className="group flex items-center justify-center gap-2.5 rounded-full bg-linear-to-r from-[#94b3f9] to-[#1877F2] px-8 pt-3 pb-3.5 text-base font-bold text-white shadow-[0_8px_20px_rgba(24,119,242,0.3)] shadow-[#1877F2]/30 transition-all hover:scale-[1.03]"
    >
      Get Started
      <ArrowRight
        size={18}
        className="transition-transform group-hover:translate-x-1"
      />
    </Link>
  );
};

export default GetStartedBtn;
