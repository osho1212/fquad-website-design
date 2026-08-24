import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { BackgroundVideo } from "@/components/ui/background-video";
import { themeInitScript } from "@/components/ui/ThemeToggle";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "F.QUAD — Architecture & Interior Design Studio",
  description:
    "F.QUAD Studio — architecture and interior design practice based in Hyderabad. Functional, Futuristic, Friendly, Flexible.",
};

import { StartProjectProvider } from "@/components/ui/StartProjectModalContext";
import { StartProjectModal } from "@/components/ui/StartProjectModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <head>
        {/* Sets data-theme before first paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-black text-white antialiased min-h-screen selection:bg-white selection:text-black relative font-sans">
        <StartProjectProvider>
          {/* Global Ambient Background Video */}
          <BackgroundVideo />

          {/* Page Content */}
          <div className="relative z-10">
            {children}
          </div>

          {/* Global Start A Project Modal */}
          <StartProjectModal />
        </StartProjectProvider>
      </body>
    </html>
  );
}
