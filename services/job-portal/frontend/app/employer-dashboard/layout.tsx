import Container from "@/components/container";
import EmployerSidebar from "@/features/employer/components/employer-sidebar";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full bg-slate-50/30">
      <EmployerSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="h-full">
          <Container>{children}</Container>
        </div>
      </main>
    </div>
  );
}
