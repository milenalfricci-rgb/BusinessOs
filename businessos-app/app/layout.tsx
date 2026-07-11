import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar/sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BusinessOS",
  description:
    "A single structured place for a solo founder to record and revisit the core facts and decisions of the business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
