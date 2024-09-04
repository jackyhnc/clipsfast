"use client";

import { TUser } from "@/app/studio/types";
import VideoPlayer from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/config/firebase";
import { UserAuth } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default async function ExportClipPage({ params }: { params: { exportClipID: string } }) {
  const { user } = UserAuth() as { user: any };
  const [isProcessesingClip, setIsProcessingClip] = useState(true);

  useEffect(() => {
    const userDocRef = doc(db, "users", user.email);
    const unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
      const userDoc = snapshot.data();
      if (!userDoc) {
        throw new Error("User not found");
      }

      const clipsInProgress = userDoc.clipsInProgress;
      setIsProcessingClip(clipsInProgress.includes(params.exportClipID));

      const clipsProcessed = userDoc.clipsProcessed;
    });

    return () => unsubscribe();
  });

  function ClipProcessedPage() {
    const router = useRouter()
    useEffect(() => {
      router.push(`/studio/clips-history/clip/${params.exportClipID}`)
    },[])
    return (
      <div className="w-full h-lvh flex items-center justify-center flex-col">
        <div className="flex gap-1 w-fit">
          <div className="">🎉</div>
          <div className="text-center w-fit">Your clip has been processed!</div>
          <div className="">🎉</div>
        </div>
      </div>
    )
  }

  function ClipNotProcessedPage() {
    type TScreens = "short wait" | "long wait";
    const [screens, setScreens] = useState<TScreens>("short wait");

    useEffect(() => {
      const timeout = setTimeout(() => {
        setScreens("long wait");
      }, 3000);
      return () => clearTimeout(timeout);
    },[])

    function ShortWaitScreen() {
      return (
        <div className="w-full h-lvh flex items-center justify-center flex-col space-y-4">
          <div className="rounded-lg overflow-hidden">
            <Image
              src={"https://media1.tenor.com/m/Lh66qN7XymwAAAAC/kumala-savesta.gif"}
              alt="jake sigma loading gif"
              width={300}
              height={0}
            />
          </div>
          <div className="text-center ">Please wait. Your clip is being processed.</div>
        </div>
      );
    }

    function LongWaitScreen() {
      const videosObj = {
        jakeSigma: "https://www.youtube.com/watch?v=i0M4ARe9v0Y",
        gta6: "https://www.youtube.com/watch?v=10gjsgA6fTE&p",
        minecraft: "https://www.youtube.com/watch?v=_-2ZUciZgls"
      };
      type TVideoNames = keyof typeof videosObj;
      const [videoNames, setVideoNames] = useState<TVideoNames>("gta6");
      return (
        <div className="w-full h-lvh flex items-center justify-center flex-col space-y-6">
          <div className="gap-1 flex flex-col justify-center items-center">
            <div className="">Please wait. Your clip is being processed.</div>
            <div className="text-2xl font-medium max-w-[700px] text-center">
              While you wait, keep yourself entertained with our collection of Brainrot videos 🧠🤯😂
            </div>
          </div>
          <div className="rounded-lg overflow-hidden w-[200px] sm:w-[400px] md:w-[600px]">
            <VideoPlayer
              url={videosObj[videoNames]}
              aspectRatio="16/9"
              className="rounded-sm z-1"
              autoPlay={false}
              controls={true}
              clipStartTime={20}
              muted={true}
              loop={true}
            />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="">
                <Button className="w-full text-left">Select video</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.keys(videosObj).map((key) => {
                  return (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setVideoNames(key as TVideoNames);
                        }}
                      >
                        {key}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="text-sm text-[var(--slight-gray)] max-w-[400px] px-2">
              ⓘ You can leave this page anytime and the process will still be processing. You can view the
              completed clip in the "Clips" tab in the sidebar.
            </div>
          </div>
        </div>
      );
    }

    if (screens === "short wait") {
      return <ShortWaitScreen />;
    } else if (screens === "long wait") {
      return <LongWaitScreen />;
    }
  }

  return <div className="">{isProcessesingClip ? <ClipNotProcessedPage /> : <ClipProcessedPage />}</div>;
}
