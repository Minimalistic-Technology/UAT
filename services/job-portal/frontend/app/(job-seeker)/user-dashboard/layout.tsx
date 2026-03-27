import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GlobalRole } from "@/types";

export default async function JobSeekerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== GlobalRole.USER) {
    redirect("/login");
  }

  return <>{children}</>;
}