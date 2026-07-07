"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Linkedin, Twitter, Mail, ArrowUpRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

interface TeamMember {
  _id: string;
  name: string;
  position: string;
  bio?: string;
  imageUrl: string;
}

export default function TeamClient() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { mutate: fetchTeamMembers, data = [] } = useMutation<TeamMember[], Error, void>({
    mutationFn: () => apiFetch("/api/team/get-all-members", { method: "POST" })
  });

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const teamMembers = data;

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* HERO SECTION SAME AS YOURS — NO CHANGE */}
      <section className="relative min-h-[calc(100vh-112px)] flex items-center bg-background overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />
        </div>

        <div className="max-w-[1280px] mx-auto px-[clamp(1.5rem,5vw,4rem)] relative z-10 w-full flex items-center min-h-[60vh] lg:min-h-[70vh]">
          <div className="w-full text-center py-10">
            <span className="inline-block text-[#a3e635] font-black uppercase tracking-[0.4em] text-[0.65rem] mb-6">
              OUR COLLECTIVE
            </span>
            <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-black text-[var(--text-main)] mb-8 tracking-tighter leading-none">
              Our <span className="bg-[linear-gradient(135deg,hsl(82,84%,50%),hsl(82,84%,35%))] bg-clip-text text-transparent">Team</span>
            </h1>
            <p className="text-xl md:text-2xl text-[var(--text-dim)] font-medium leading-relaxed max-w-3xl mx-auto opacity-80">
              The collective of architects and creative minds behind Minimalistic Technology. Our web development team is a powerhouse of diverse talent, comprising expert front-end and back-end developers, creative UI/UX designers, and dedicated quality assurance engineers.
              We specialize in transforming complex business requirements into high-performing, scalable digital solutions from scratch.
              By combining years of industry experience with a commitment to the latest technologies like AI and cloud infrastructure, we ensure every project is secure, responsive, and perfectly aligned with our clients' long-term goals.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM GRID */}
      <section className="pt-20 pb-16 md:pt-24 md:pb-20">
        <div className="max-w-[1280px] mx-auto px-[clamp(1.5rem,5vw,4rem)] relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {teamMembers.map((member) => (
              <div
                key={member._id}
                className="group cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="relative p-5 flex flex-col items-center justify-center h-[180px] text-center overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] transition-all duration-700 group-hover:border-[#a3e635]/30 group-hover:bg-[#a3e635]/[0.02]">

                  <div className="relative z-10 w-full">
                    <p className="text-[#a3e635] text-[0.75rem] font-semibold uppercase tracking-[0.2em] mb-3 opacity-100">
                      {member.position}
                    </p>

                    <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight mb-4 leading-tight">
                      {member.name}
                    </h3>

                    <div className="flex justify-center">
                      <motion.div
                        whileHover={{ rotate: 45, scale: 1.1 }}
                        className="w-8 h-8 rounded-lg bg-[#a3e635] flex items-center justify-center text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]"
                      >
                        <ArrowUpRight size={16} />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-[var(--surface)] border border-[var(--border-bright)] rounded-[40px] p-10 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-5 right-5"
                onClick={() => setSelectedMember(null)}
              >
                <X />
              </button>

              <h2 className="text-4xl font-black mb-4">
                {selectedMember.name}
              </h2>

              <p className="text-[#a3e635] text-lg font-semibold mb-6">
                {selectedMember.position}
              </p>

              {selectedMember.bio && (
                <p className="text-[var(--text-dim)] mb-8">
                  {selectedMember.bio}
                </p>
              )}

              <div className="flex justify-center gap-6">
                <a href="#" className="hover:text-[#a3e635]">
                  <Linkedin />
                </a>
                <a href="#" className="hover:text-[#a3e635]">
                  <Twitter />
                </a>
                <a href="#" className="hover:text-[#a3e635]">
                  <Mail />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}