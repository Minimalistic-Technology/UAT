"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";

interface GlobalSearchProps {
  onCreatePlan?: () => void;
}

export function GlobalSearch({ onCreatePlan }: GlobalSearchProps = {}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="group relative hidden w-full max-w-[280px] cursor-pointer items-center md:flex"
      >
        <Search
          className="group-focus-within:text-primary absolute left-3.5 h-4 w-4 text-slate-400 transition-colors duration-200"
          strokeWidth={2.5}
        />
        <div className="focus:border-primary/40 focus:ring-primary/10 flex h-[38px] w-full items-center rounded-full border border-slate-200 bg-slate-100/50 px-10 text-sm text-slate-400 shadow-sm transition-all focus:bg-white focus:ring-4 focus:outline-none dark:border-slate-800 dark:bg-slate-900">
          Search resources...
          <kbd className="pointer-events-none absolute right-3 hidden h-5 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100 select-none sm:flex dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/admin-dashboard/users"))
                }
              >
                User Management
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/admin-dashboard/kyc"))
                }
              >
                Pending KYC Applications
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/admin-dashboard/analytics"))
                }
              >
                Analytics & Reports
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem
                onSelect={() =>
                  runCommand(() =>
                    router.push("/admin-dashboard/coupons/create"),
                  )
                }
              >
                Create New Coupon
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => {
                    if (onCreatePlan) onCreatePlan();
                    else router.push("/admin-dashboard/plans/create");
                  })
                }
              >
                Create New Plan
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/admin-dashboard/settings"))
                }
              >
                System Settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
