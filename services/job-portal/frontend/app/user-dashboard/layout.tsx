import Container from "@/components/container";
import UserSidebar from "@/features/user/components/user-sidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full bg-slate-50/30">
      <UserSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="h-full">
          <Container>{children}</Container>
        </div>
      </main>
    </div>
  );
}
