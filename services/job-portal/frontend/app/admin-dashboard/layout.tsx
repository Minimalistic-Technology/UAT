import Container from "@/components/container";
import { Sidebar } from "@/features/admin/components/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh+4rem)] bg-background -mt-16 w-full">
      <Sidebar />
      <main className="flex-1 lg:pl-64 flex flex-col bg-background/50">
        <div className="flex-1 px-4 py-8 sm:px-8 pt-20 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
