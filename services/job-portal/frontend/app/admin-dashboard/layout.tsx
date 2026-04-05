import Container from "@/components/container";
import { Sidebar } from "@/features/admin/components/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full bg-slate-50/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="h-full">
          <Container>{children}</Container>
        </div>
      </main>
    </div>
  );
}
