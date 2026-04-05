import Link from "next/link";
import { FileQuestion, Home, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "react-resizable-panels";

export default function NotFound() {
  return (
    <main className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Text Content */}
        <div className="space-y-3">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <h1 className="text-foreground text-5xl font-extrabold tracking-tighter sm:text-8xl">
              404
            </h1>

            {/* Vertical Separator - Hidden on mobile, shown on sm+ */}
            <div className="bg-border hidden h-12 w-px rounded-full sm:block"></div>

            {/* Horizontal Separator - Shown on mobile, hidden on sm+ */}
            <div className="bg-border h-px w-12 rounded-full sm:hidden"></div>

            <div className="text-center sm:text-left">
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Page not found
              </h2>
            </div>
          </div>
          <p className="text-muted-foreground text-md">
            The page you are looking for doesn&apos;t exist or has been moved to
            another URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button asChild className="w-full sm:w-auto">
            <Link href="/jobs">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Browse Jobs
            </Link>
          </Button>
        </div>

        {/* Support Link */}
        <p className="text-muted-foreground text-sm">
          Think this is a mistake?{" "}
          <Link
            href="/contact"
            className="text-primary font-medium hover:underline"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </main>
  );
}
