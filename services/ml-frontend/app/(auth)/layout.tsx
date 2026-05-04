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
      <body className="min-h-full flex flex-col">
        <Providers>
          <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
            {children}
          </div>
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
