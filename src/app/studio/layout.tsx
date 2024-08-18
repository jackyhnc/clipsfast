"use client";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebase";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { UserAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ProjectsContextProvider } from "@/context/ProjectsContext";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";

const bigSidebarWidth = 220
const smallSidebarWidth = 80

function Sidebar(props: any) {
  const { minimizedSidebar, setMinimizedSidebar } = props;
  const { user, signout } = UserAuth() as { user: any; signout: any };
  
  const [userPlan, setUserPlan] = useState(undefined);
  const [minutesAnalyzed, setMinutesAnalyzed] = useState(undefined);

  useEffect(() => {
    const userDocRef = doc(db, "users", user.email);

    const unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
      const userDoc = snapshot.data();

      const userPlan = userDoc?.userPlan;
      if (userPlan) {
        setUserPlan(userPlan)
      }

      const minutesAnalyzed = userDoc?.minutesAnalyzed;
      if (minutesAnalyzed) {
        setMinutesAnalyzed(minutesAnalyzed)
      }
    });
    return () => unsubscribe();
  }, []);

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
      name: "Profile",
      link: "/studio/profile",
      icon: "fa-solid fa-user",
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
        style={{paddingLeft:"8px"}}
        variant={"ghost"}
        onClick={() => setMinimizedSidebar(!minimizedSidebar)}
      >
        <i className="fa-solid fa-arrows-left-right text-[var(--purple-black)] text-xl"></i>
      </Button>
    )
  }

  function BigSidebar() {
    //fetch users plan and amount of videos left
    
    let usersPlan
    let usersAmountOfVideoLeft
    return (
      <div
      className={`fixed left-0 top-0 px-4 bg-[var(--bg-yellow-white)] 
      h-lvh flex flex-col gap-6 items-center py-10 justify-between`}
      style={{width: bigSidebarWidth}}
      >
        <div className="flex flex-col gap-10 w-full">
          <div className="flex gap-8 items-center">
            <div className="box-border p-2 cursor-pointer text-sm font-medium">
              Tokens Left: / 100
            </div>
            {/*
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
            */}
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
                      <i
                        className={`${button.icon} text-[var(--purple-black)] text-xl`}
                      ></i>
                      <div className="text-[var(--purple-black)] text-left">
                        {button.name}
                      </div>
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
              <i
                className={`fa-solid fa-right-from-bracket text-[var(--purple-black)] text-xl`}
              ></i>
              <div className="text-[var(--purple-black)] text-left">Sign out</div>
            </div>
          </Button>
        </div>
      </div>
    )
  }
  function SmallSidebar() {
    return (
      <div
      className={`fixed left-0 top-0 px-4 bg-[var(--bg-yellow-white)] 
      h-lvh flex flex-col gap-6 items-center py-10 justify-between`}
      style={{width: smallSidebarWidth}}
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
                  className="w-full cursor-pointer"
                  key={button.name}
                  onClick={() => router.push(button.link)}
                >
                  <i
                    className={`${button.icon} text-[var(--purple-black)] text-xl size-5`}
                  ></i>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="w-full">
          <Button
            variant={"ghost"}
            className="w-full cursor-pointer"
            onClick={() => handleSignoutClick()}
          >
            <i
              className={`fa-solid fa-right-from-bracket text-[var(--purple-black)] text-xl`}
            ></i>
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

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isUserValid, setIsUserValid] = useState(false);

  const [minimizedSidebar, setMinimizedSidebar] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsUserValid(true);
        } else {
          router.push("/");
          toast({
            title: "You need an account to access that page.",
            variant: "destructive",
            duration: 2000,
          });
        }
      });
    };
    checkAuth();
  }, []);

  if (isUserValid) {
    return (
      <>
        <Sidebar
          minimizedSidebar={minimizedSidebar}
          setMinimizedSidebar={setMinimizedSidebar}
        />
        <div className="px-14 py-20" style={{ marginLeft: `${minimizedSidebar ? smallSidebarWidth : bigSidebarWidth}px` }}>
          <ProjectsContextProvider>{children}</ProjectsContextProvider>
        </div>
      </>
    );
  }
}
