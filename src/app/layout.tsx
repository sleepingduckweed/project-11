import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { DialogProvider } from "@/providers/DialogProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kiyamaa's Kitchen Admin",
  description: "WhatsApp-first prepaid tiffin management system",
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
          <DialogProvider>
            {children}
          </DialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
