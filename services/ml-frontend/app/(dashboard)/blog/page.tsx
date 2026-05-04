import { BlogList } from "@/features/blog/components/blog-list";

export default function BlogPage() {
  return (
    <main className="flex-1 w-full pt-32 pb-20">
      <div className="w-full px-[5%]">
        <header className="mb-16">
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter uppercase italic mb-4">
            <span className="text-[#1877F2]">Our</span> Blogs
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl font-medium">
            Explore our latest insights, success stories, and industry
            expertise.
          </p>
        </header>

        <BlogList />
      </div>
    </main>
  );
}
