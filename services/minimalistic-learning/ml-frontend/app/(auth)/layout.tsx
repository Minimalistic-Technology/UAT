import "../(dashboard)/globals.css";
import Providers from "../(dashboard)/providers";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-background text-foreground" suppressHydrationWarning>
        <Providers>
          <main className="flex flex-col flex-1 transition-colors duration-500">
            {children}
          </main>
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
