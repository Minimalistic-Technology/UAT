import React from 'react';
import type { Metadata } from "next";
import Layout from "@/components/Layout";
import "./globals.css";

export const metadata: Metadata = {
    title: "Minimalistic Technology | Engineering the Future",
    description: "Premium web design and development agency. AI-powered website builder. From idea to live website in weeks.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body>
                <Layout>{children}</Layout>
            </body>
        </html>
    );
}
