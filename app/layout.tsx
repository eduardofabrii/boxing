// layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Boxing App",
  description: "Created by João and Eduardo",
  icons: {
    icon: [
      { url: "/luvas-de-boxe.ico" },
      { url: "/luvas-de-boxe.png", type: "image/png" }
    ],
    shortcut: "/luvas-de-boxe.ico",
    apple: "/luvas-de-boxe.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>{children}</body>
    </html>
  );
}
