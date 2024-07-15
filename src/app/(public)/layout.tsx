import Image from "next/image";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
  } from "@/components/ui/navigation-menu"
import Link from "next/link";
  
function Navbar() {
    return (
      <div className="justify-between flex px-10 py-2 fixed top-0 right-0 left-0 bg-[var(--bg-yellow-white)] z-[1000] h-14">
        <NavigationMenu>
          <NavigationMenuList>
  
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <Image
                  src="/assets/logo.svg"
                  alt="logo"
                  width={0}
                  height={0}
                  className="w-[130px] h-auto mr-4 cursor-pointer"
                />
       
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Pricing
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
        
  
        <NavigationMenu>
          <NavigationMenuList>
  
            <NavigationMenuItem>
              <Link href="/signin" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Sign In
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
  
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    )
}

export default function PublicLayout({children}: {children: React.ReactNode}) {

    return (
        <>
            <Navbar />
            {children}
        </>
    )
}