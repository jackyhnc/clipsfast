"use client";

import { useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";

import { useRouter } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

import { UserAuth } from "@/context/AuthContext";
import { ProjectsContextProvider } from "@/context/ProjectsContext";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { StudioNavbar } from "@/components/StudioNavbar";

const bigSidebarWidth = 220;
const smallSidebarWidth = 84;

function Sidebar(props: any) {
  const { minimizedSidebar, setMinimizedSidebar } = props;
  const { signout } = UserAuth() as { user: any; signout: any };

  const router = useRouter();
  const handleSignoutClick = async () => {
    try {
      await signout();
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  const sidebarButtonsObject = [
    {
      name: "Dashboard",
      link: "/studio",
      icon: "fa-solid fa-house",
    },
    {
      name: "Clips History",
      link: "/studio/clips-history",
      icon: "fa-solid fa-clock-rotate-left",
    },
    {
      name: "Usage",
      link: "/studio/usage",
      icon: "fa-solid fa-chart-simple",
    },
    {
      name: "Settings",
      link: "/studio/settings",
      icon: "fa-solid fa-gear",
    },
  ];

  function SidebarTriggerButton() {
    return (
      <Button
        className="p-2"
        style={{ paddingLeft: "8px" }}
        variant={"ghost"}
        onClick={() => setMinimizedSidebar(!minimizedSidebar)}
      >
        <i className="fa-solid fa-arrows-left-right text-[var(--purple-black)] text-xl"></i>
      </Button>
    );
  }

  function BigSidebar() {
    return (
      <div
        className="fixed left-0 top-0 px-4 bg-[var(--bg-yellow-white)] 
      h-lvh flex flex-col gap-6 items-center py-10 justify-between z-50"
        style={{ width: bigSidebarWidth }}
      >
        <div className="flex flex-col gap-10 w-full">
          <div className="flex gap-8 items-center">
            <Link href="/" className="box-border p-2 cursor-pointer">
              <Image
                src={"/assets/logo.svg"}
                alt="logo"
                width={0}
                height={0}
                className="w-full h-auto cursor-pointer select-none pointer-events-none"
                priority={true}
                draggable={false}
              />
            </Link>
            <SidebarTriggerButton />
          </div>

          <div className="space-y-2 flex flex-col">
            {sidebarButtonsObject.map((button) => {
              return (
                <Button
                  variant={"ghost"}
                  className="w-full justify-start cursor-pointer"
                  key={button.name}
                  onClick={() => router.push(button.link)}
                >
                  <div className="flex gap-3 items-start px-0">
                    <div className="size-5 flex items-center justify-center">
                      <i className={`${button.icon} text-[var(--purple-black)] text-xl`}></i>
                    </div>
                    <div className="text-[var(--purple-black)] text-left">{button.name}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="w-full">
          <Button
            variant={"ghost"}
            className="w-full justify-start cursor-pointer px-3"
            onClick={() => handleSignoutClick()}
          >
            <div className="flex gap-3 items-start px-0">
              <i className={`fa-solid fa-right-from-bracket text-[var(--purple-black)] text-xl`}></i>
              <div className="text-[var(--purple-black)] text-left">Sign out</div>
            </div>
          </Button>
        </div>
      </div>
    );
  }
  function SmallSidebar() {
    return (
      <div
        className="fixed left-0 top-0 px-4 bg-[var(--bg-yellow-white)] 
      h-lvh flex flex-col gap-6 items-center py-10 justify-between"
        style={{ width: smallSidebarWidth }}
      >
        <div className="flex flex-col gap-10 w-full">
          <div className="flex flex-col gap-3 items-center">
            <SidebarTriggerButton />
          </div>

          <div className="space-y-2 flex flex-col">
            {sidebarButtonsObject.map((button) => {
              return (
                <Button
                  variant={"ghost"}
                  className="w-full cursor-pointer px-2"
                  key={button.name}
                  onClick={() => router.push(button.link)}
                >
                  <div className="size-5 flex justify-center items-center">
                    <i className={`${button.icon} text-[var(--purple-black)] text-xl`}></i>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="w-full">
          <Button variant={"ghost"} className="w-full cursor-pointer" onClick={() => handleSignoutClick()}>
            <i className={`fa-solid fa-right-from-bracket text-[var(--purple-black)] text-xl`}></i>
          </Button>
        </div>
      </div>
    );
  }

  if (minimizedSidebar) {
    return <SmallSidebar />;
  } else {
    return <BigSidebar />;
  }
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();

  const [isUserValid, setIsUserValid] = useState(false);

  const [smallScreen, setSmallScreen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setSmallScreen((typeof window && window.innerWidth) < 630);
    };
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [minimizedSidebar, setMinimizedSidebar] = useState(false);
  useEffect(() => {
    setMinimizedSidebar(smallScreen);
  }, [smallScreen]);

  useEffect(() => {
    const checkAuth = () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsUserValid(true);
        } else {
          router.push("/");
          console.error("You need an account to access that page.");
        }
      });
    };
    checkAuth();
  }, [router, toast]);

  if (isUserValid) {
    return (
      <>
        <Sidebar minimizedSidebar={minimizedSidebar} setMinimizedSidebar={setMinimizedSidebar} />
        <div
          className="px-4 sm:px-14 pb-20"
          style={{
            marginLeft: `${
              minimizedSidebar
                ? smallSidebarWidth
                : typeof window && window.innerWidth > 630
                ? bigSidebarWidth
                : smallSidebarWidth
            }px`,
          }}
        >
          <ProjectsContextProvider>{children}</ProjectsContextProvider>
        </div>
      </>
    );
  }

  
  try {
  } catch (error: any) {
    toast({
      title: error.message,
      variant: "destructive",
      duration: 2000,
    });
  }
}
