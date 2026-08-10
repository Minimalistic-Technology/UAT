import "./globals.css";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "./provider/theme-provider";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import { AuthProvider } from "./_context/AuthContext";
import { CartProvider } from "./_context/CartContext";
import { ToastProvider } from "./_context/ToastContext";
import { RouteProvider } from "./_context/RouteContext";
import { GoogleAnalytics } from "@next/third-parties/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || process.env.GA_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} min-h-screen flex flex-col font-poppins`} suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <RouteProvider>
                <CartProvider>
                  <Navbar />

                  {/* Main content grows to push footer down */}
                  <main className="min-h-screen flex-1">
                    {children}
                  </main>

                  <Footer />
                </CartProvider>
              </RouteProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}

