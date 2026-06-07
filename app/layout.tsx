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
  title: "Bow - Your Shift Companion",
  description: "Bow is your ultimate shift companion, designed to help you effortlessly track your work hours, manage your schedule, and visualize your earnings. With Bow, you can easily log your shifts, monitor your income progression, and stay organized with a sleek and intuitive interface. Whether you're a part-time worker or a full-time employee, Bow empowers you to take control of your work life and make the most of every shift.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
