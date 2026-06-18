import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "Minimalistic Learning | Elevate Your Knowledge",
		template: "%s | Minimalistic Learning"
	},
	description: "A premium blog platform for sharing minimal technology insights, learning experiences, and coding walkthroughs.",
	keywords: ["Learning", "Tech", "Walkthroughs", "Minimalism", "Development"],
};

import Providers from "./providers";
import { Toaster } from "sonner";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
				<Providers>
					<div className="flex flex-col min-h-screen bg-background text-foreground">
						{children}
					</div>
					<Toaster position="top-right" richColors />
				</Providers>
			</body>
		</html>
	);
}
