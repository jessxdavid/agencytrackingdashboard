import "./globals.css";
import type { Metadata, Viewport } from "next";
import { TopNav } from "@/components/TopNav";
import { Gate } from "@/components/Gate";

export const metadata: Metadata = {
  title: "Agency Acquisition Dashboard",
  description: "Outreach pipeline for signing more agency clients",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0c",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeInit = `(function(){try{if(localStorage.getItem("theme")==="light"){var c=document.documentElement.classList;c.remove("dark");c.add("light");}}catch(e){}})();`;
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground pb-[env(safe-area-inset-bottom)]">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Gate>
          <TopNav />
          {children}
        </Gate>
      </body>
    </html>
  );
}
