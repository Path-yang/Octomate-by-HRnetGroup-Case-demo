import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppProviders } from "@/components/providers/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Octomate by HRnet - Employee Profile Management",
  description: "A comprehensive HR Employee Profile Management System demo for PM internship assessment. Built with Next.js 14, TypeScript, and Tailwind CSS.",
  keywords: ["HR", "Employee Management", "HRMS", "Singapore", "HRnet", "Octomate"],
  authors: [{ name: "HRnet Group" }],
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <AppProviders>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
