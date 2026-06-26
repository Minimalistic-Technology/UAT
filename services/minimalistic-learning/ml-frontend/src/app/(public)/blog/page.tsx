import { BlogList } from "@/features/blog/components/blog-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs & Articles",
  description:
    "Explore our latest insights, success stories, and industry expertise.",
};

export default function BlogPage() {
  return (
    <main className="w-full flex-1 pt-6 pb-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-foreground mb-4 text-4xl font-black tracking-tighter uppercase italic sm:text-6xl">
            <span className="text-theme-action">Our</span> Blogs
          </h1>
          <p className="text-foreground/70 max-w-2xl text-lg font-medium">
            Explore our latest insights, success stories, and industry
            expertise.
          </p>
        </header>

        <BlogList />
      </div>
    </main>
  );
}
