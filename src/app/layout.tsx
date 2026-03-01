import type { Metadata, Viewport } from "next";
import { Inter, Heebo } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const heebo = Heebo({ 
  subsets: ["hebrew"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "Tuval Finance",
  description: "Hedge fund level market analysis for every investor",
};

export const viewport: Viewport = {
  themeColor: "#0d1421",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body 
        className={`${inter.variable} ${heebo.variable} antialiased bg-[#0d1421] text-white min-h-screen`}
      >
        {/* Header - sticky at top */}
        <Header />
        
        {/* Main content with padding for header and bottom nav */}
        <main className="pb-20 pt-[env(safe-area-inset-top)]">
          {children}
        </main>
        
        {/* Bottom Navigation - fixed at bottom */}
        <BottomNav />
      </body>
    </html>
  );
}
