"use client";

import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import QueryProvider from "../providers/QueryProvider";
import { ThemeProvider } from "next-themes";

interface LayoutProps { 
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <QueryProvider>
      <ThemeProvider attribute="class">
        <div className="min-h-screen flex flex-col bg-[var(--background)]">
          <Navbar />
          <main className="flex-grow relative pt-[var(--nav-height)]">
            {children}
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </QueryProvider>
  );
};

export default Layout;
