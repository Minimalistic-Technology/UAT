import { BlogList } from "@/features/blog/components/blog-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs & Articles",
  description: "Explore our latest insights, success stories, and industry expertise.",
};

export default function BlogPage() {
  return (
    <main className="flex-1 w-full pt-32 pb-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tighter uppercase italic mb-4">
            <span className="text-theme-action">Our</span> Blogs
          </h1>
          <p className="text-foreground/70 text-lg max-w-2xl font-medium">
            Explore our latest insights, success stories, and industry
            expertise.
          </p>
        </header>

        <BlogList />
      </div>
    </main>
  );
}
