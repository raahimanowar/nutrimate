import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserInfoProvider } from "@/lib/context/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutriMATE - Smart Food Tracking for Sustainable Living",
  description: "Track food consumption, manage inventory, and reduce waste with NutriMATE. Building sustainable habits one meal at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserInfoProvider>
          {children}
        </UserInfoProvider>
      </body>
    </html>
  );
}
