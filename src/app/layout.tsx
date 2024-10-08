import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import "@uploadthing/react/styles.css"
import { ourFileRouter } from "@/app/api/uploadthing/core";

import TanstackProvider from "@/providers/TanstackProvider";

import { Analytics } from "@vercel/analytics/react"

import { Toaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "ClipsFast",
  description: "Generated by create next app",
};

import { AuthContextProvider } from "@/context/AuthContext";

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://kit.fontawesome.com/c7f29f3608.js" crossOrigin="anonymous" async></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
      </head>
      <body className={inter.className} >
        <Analytics />
        <NextSSRPlugin
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <AuthContextProvider>
          <TanstackProvider>
            <main>
              {children}  
            </main>
            <Toaster />
          </TanstackProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
