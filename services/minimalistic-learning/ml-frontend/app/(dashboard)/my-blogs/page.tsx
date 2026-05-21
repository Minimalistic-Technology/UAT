import { BlogManagement } from "@/features/blog/components/blog-management";

export default function MyBlogsPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-20">
        <BlogManagement />
      </main>
    </div>
  );
}
