import type { Metadata } from "next";
import { Inter } from "next/font/google"; // We use Inter as the premium font as per instructions
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "AutoPilot DeFi Agent",
  description: "Autonomous AI-powered DeFi agent on Uniswap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="absolute inset-0 z-[-1] min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background"></div>
        {children}
      </body>
    </html>
  );
}
