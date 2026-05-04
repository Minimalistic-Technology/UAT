import React from "react";
import { BlogManagement } from "@/features/blog/components/blog-management";
import { Navbar } from "@/components/Navbar";

export default function MyBlogsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-20">
        <BlogManagement />
      </main>
    </div>
  );
}
