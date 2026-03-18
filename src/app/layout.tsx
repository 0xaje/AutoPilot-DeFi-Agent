import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit"
});

export const metadata: Metadata = {
  title: "AutoPilot | Autonomous DeFi",
  description: "Advanced AI-powered agent orchestrating autonomous DeFi state transitions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${outfit.variable} font-sans`}>
        {/* Deep, highly-subtle background gradient */}
        <div className="fixed inset-0 z-[-1] min-h-screen bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(67,56,202,0.12),rgba(0,0,0,1)_80%)]"></div>
        {children}
      </body>
    </html>
  );
}
