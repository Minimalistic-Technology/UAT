import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import TransactionDashboard from "./TransactionDashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            MoneyApp
          </h1>
          <p className="text-xs text-zinc-500">{session.user.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="flex-1 px-6 py-6">
        <TransactionDashboard />
      </main>
    </div>
  );
}
