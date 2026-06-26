"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@/features/auth/context/auth-context";

export default function Providers({ children }: { children: React.ReactNode }) {
 const [queryClient] = useState(() => new QueryClient({
 defaultOptions: {
 queries: {
 retry: (failureCount, error: any) => {
 // Do NOT retry 4xx errors (Bad Request, Unauthorized, Forbidden), it's useless load.
 if (error?.response?.status >= 400 && error?.response?.status < 500) {
 return false;
 }
 // Only retry 5xx server errors or Network-level drops, up to 3 times
 return failureCount < 3;
 },
 refetchOnWindowFocus: false, // Saves massive bandwidth
 },
 mutations: {
 retry: false, // Never retry mutations automatically to avoid duplicate actions
 }
 }
 }));

 return (
 <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
 <QueryClientProvider client={queryClient}>
 <AuthProvider>
 {children}
 </AuthProvider>
 </QueryClientProvider>
 </ThemeProvider>
 );
}
