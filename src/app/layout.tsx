import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
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

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from "next/link";
import { AuthContextProvider } from "@/context/AuthContext";

function Navbar() {
  return (
    <div className="justify-between flex px-10 py-2 fixed top-0 right-0 left-0 bg-[var(--yellow-white)] z-[1000] ">
      <NavigationMenu>
        <NavigationMenuList>

          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <Image
                src="/assets/logo.svg"
                alt="logo"
                width={0}
                height={0}
                className="w-[130px]h-auto mr-4 cursor-pointer"
              />
     
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link href="/pricing" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Pricing
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          

        </NavigationMenuList>
      </NavigationMenu>
      

      <NavigationMenu>
        <NavigationMenuList>

          <NavigationMenuItem>
            <Link href="/login" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Log In
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  
  return (
    <html lang="en">
      <body className={inter.className} >
        <Analytics />
        <NextSSRPlugin
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <AuthContextProvider>
          <TanstackProvider>
            <Navbar />
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
