import type { Metadata } from "next";
import "./globals.css";
import { BackgroundVideo } from "@/components/ui/background-video";

export const metadata: Metadata = {
  title: "F.QUAD — Architecture & Interior Design Studio",
  description:
    "F.QUAD Studio — architecture and interior design practice based in Hyderabad. Functional, Futuristic, Friendly, Flexible.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased min-h-screen selection:bg-white selection:text-black relative">
        {/* Global Ambient Background Video */}
        <BackgroundVideo />

        {/* Page Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
