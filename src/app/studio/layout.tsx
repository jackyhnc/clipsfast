import MediaURLsContextProvider from "@/context/MediaURLsContext"
import Image from "next/image"
import Link from "next/link";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
  } from "@/components/ui/navigation-menu"
  
function Navbar() {
    return (
      <div className="flex px-10 py-2 fixed top-0 right-0 left-0 bg-[var(--bg-white)] z-[1000] ">
        <NavigationMenu>
          <NavigationMenuList>
  
            <NavigationMenuItem>
              <Link href="/profile" legacyBehavior passHref>
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
    )
}

export default function MainLayout({ children }: { children: React.ReactNode }) {

    return (
        <>
            <Navbar />  
            <div className="mt-14">
                <MediaURLsContextProvider>
                    {children}
                </MediaURLsContextProvider>
            </div>
        
        </>
    )
}
