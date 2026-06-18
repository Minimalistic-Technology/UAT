"use client"
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const GetStartedBtn = () => {
    return (
        <Link
            href="/login"
            className="group flex items-center justify-center gap-2.5 px-8 pt-3 pb-3.5 bg-gradient-to-r from-[#94b3f9] to-[#1877F2] text-white rounded-full font-bold text-base hover:scale-[1.03] active:scale-95 transition-all shadow-[0_8px_20px_rgba(24,119,242,0.3)] shadow-[#1877F2]/30"
        >
            Get Started
            <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
            />
        </Link>
    );
};

export default GetStartedBtn;
