import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "مولد روتین هفتگی — Weekly OS",
  description:
    "مولد روتین هفتگی با چارچوب ثابت و روتین متغیر — ذخیره‌سازی محلی، کارآمد و آفلاین.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "مولد روتین",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f9f4" },
    { media: "(prefers-color-scheme: dark)", color: "#04070d" },
  ],
};

const THEME_BOOT = `try{var t=JSON.parse(localStorage.getItem("rg:theme"));if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" />
        <Script id="theme-boot" strategy="beforeInteractive">{THEME_BOOT}</Script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
