import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-black px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          MoneyApp
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in with Google to pull your transaction emails into one list
          and export them to Excel.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-4 text-xs text-zinc-500">
          We only request read-only Gmail access to find transaction emails.
        </p>
      </div>
    </div>
  );
}
