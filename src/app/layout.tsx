import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import { NotificationProvider } from "@/contexts/SocketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stories - Share Your World",
  description: "A premium social platform for sharing stories, connecting with others, and building meaningful relationships.",
  keywords: ["stories", "social", "blog", "share", "community"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://blog-web-five-rose.vercel.app'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <Navbar />
            <main className="pt-20 min-h-screen">
              {children}
            </main>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
