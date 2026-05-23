"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useAuthStore } from "@/store/auth.store";

const Navbar = () => {
  const { mutate: logout, isPending } = useLogout();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <nav className="flex items-center justify-between h-16 px-12 border-b bg-background fixed top-0 inset-x-0">
      <div className="font-bold text-xl">
        Drive Sheet
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated && (
          <Button variant="outline" onClick={() => logout()} disabled={isPending} >
            {isPending ? "Logging out..." : "Logout"}
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;