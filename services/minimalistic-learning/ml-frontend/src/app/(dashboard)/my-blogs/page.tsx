import { BlogManagement } from "@/features/blog/components/blog-management";

export default function MyBlogsPage() {
  return (
    <div className="min-h-screen">
      <main className="w-full px-6 sm:px-8 lg:px-8 pt-6 pb-6">
        <BlogManagement />
      </main>
    </div>
  );
}
