import React from "react";
import { Navbar } from "@/components/Navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* The Navbar is h-16 fixed, so we add pt-16 to push the content down exactly 4rem */}
      <main className="flex flex-grow flex-col pt-16">{children}</main>
    </div>
  );
}
