import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import "./globals.css";
import Footer from "@/components/navigation/Footer";

export const metadata: Metadata = {
  title: "SysRegister",
  description: "Un nuovo modo di consultare il registro 🖥️",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark`}>
        <div className="max-w-xl overflow-x-hidden mx-auto px-4 min-h-svh antialiased">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
