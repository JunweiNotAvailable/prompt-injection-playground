import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { SessionProvider } from "@/contexts/SessionContext";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InjectionLab — 提示注入測試平台",
  description: "在安全環境中測試和分析 AI 提示注入攻擊的專業工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0e1a] min-h-screen relative`}
      >
        <AppProvider>
          <SessionProvider>
            <Navigation />
            {children}
          </SessionProvider>
        </AppProvider>
      </body>
    </html>
  );
}
