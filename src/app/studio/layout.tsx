"use client"

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";

import MediaURLsContextProvider from "@/context/MediaURLsContext"

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import { useEffect, useState } from "react";
import { UserAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

function Sidebar({sidebarWidth}: {sidebarWidth: number}) {
  const { user, signout } = UserAuth()

  const router = useRouter()

  const handleSignoutClick = async () => {
    try {
      await signout()
    } catch (error) {
      console.error(error)
    }
  }
  
  const sidebarButtonsObject = [
    {
      name: "Dashboard",
      link: "/studio",
      icon: "fa-solid fa-house"
    },
    {
      name: "Profile",
      link: "/studio/profile",
      icon: "fa-solid fa-user"
    },
    {
      name: "Settings",
      link: "/studio/settings",
      icon: "fa-solid fa-gear"
    },
    {
      name: "Usage",
      link: "/studio/usage",
      icon: "fa-solid fa-chart-simple"
    }
  ]

  return (
    <div className={`fixed left-0 top-0 px-4 bg-[var(--bg-yellow-white)] 
    h-lvh flex flex-col gap-6 items-center py-10 justify-between`}
    style={{width: `${sidebarWidth}px`}}
    >
      
      <div className="flex flex-col gap-10 w-full">
        <div className="px-3">
          <Image 
            src={"/assets/logo.svg"}
            alt="logo"
            width={0}
            height={0}
            className="w-full h-auto cursor-pointer"
            onClick={() => router.push("/")}
            priority={true}
          />
        </div>

        <div className="space-y-2">
          <div className="font-medium">Menu</div>

          <div className="space-y-2 flex flex-col">
            {sidebarButtonsObject.map((button) => {
              return (
                <Button variant={"ghost"} className="w-full justify-start cursor-pointer px-3" key={button.name}>
                  <Link href={button.link} passHref legacyBehavior>
                    <div className="flex gap-3 items-start px-0">
                      <i className={`${button.icon} text-[var(--purple-black)] text-xl`}></i>
                      <div className="text-[var(--purple-black)] text-left">{button.name}</div>
                    </div>
                  </Link>
                </Button>
              )
            })}

          </div>
        </div>
      </div>

      <div className="w-full">
        <Button variant={"ghost"} className="w-full justify-start cursor-pointer px-3" onClick={() => handleSignoutClick()}>
          <div className="flex gap-3 items-start px-0">
            <i className={`fa-solid fa-right-from-bracket text-[var(--purple-black)] text-xl`}></i>
            <div className="text-[var(--purple-black)] text-left">Sign out</div>
          </div>
        </Button>
      </div>

    </div>      

    /*
    <div className="flex px-10 py-2 fixed top-0 right-0 left-0 bg-[var(--bg-yellow-white)] z-[1000] ">
      <NavigationMenu>
        <NavigationMenuList>

          <NavigationMenuItem>
            <Link href="/studio/profile" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Profile
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/studio" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Dashboard
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

        </NavigationMenuList>
      </NavigationMenu>      
    </div>
      */

  )
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, signout } = UserAuth()
  const router = useRouter();
  const [isUserValid, setIsUserValid] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(220)

  useEffect(() => {
    const checkAuth = () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsUserValid(true);
        } else {
          toast({
            title: "You need an account to access that page.",
            variant: "destructive",
            duration: 2000,
          })
          router.back();
        }
      });
    };
    checkAuth();
  }, []);

  if (isUserValid) {
    return (
        <>
            <Sidebar sidebarWidth={sidebarWidth}/>
            <div style={{marginLeft: `${sidebarWidth}px`}}>
                <MediaURLsContextProvider>
                    {children}
                </MediaURLsContextProvider>
            </div>
        
        </>
    )
  }

}
