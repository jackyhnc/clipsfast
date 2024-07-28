"use client";

import VideoPlayer from "@/components/VideoPlayer";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from "react";

export default function Loading() {
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowImage(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 text-lg w-lvw h-lvh bg-[var(--bg-yellow-white)]">
      <div className="font-medium">Loading...</div>
      {showImage ? (
        <Image
          src={"https://media1.tenor.com/m/Lh66qN7XymwAAAAC/kumala-savesta.gif"}
          alt="jake sigma loading gif"
          width={150}
          height={0}
          className="rounded-lg"
        />
      ) :
      (
        <i className="fa-solid fa-spinner animate-spin text-5xl"></i>
      )}
    </div>
  );
}

/*
export default function Loading() {
  const [loadingState, setLoadingState] = useState(1);
  useEffect(() => {
    setTimeout(() => {
      setLoadingState(2);
    }, 1000);

    setTimeout(() => {
      setLoadingState(3);
    }, 10000);
  }, []);

  const [videoDisplayed, setVideoDisplayed] = useState<
    "jake-sigma" | "gta-6" | undefined
  >("jake-sigma");

  if (loadingState === 1) {
    return (
      <div className="w-lvw h-lvh flex items-center justify-center bg-[var(--bg-yellow-white)]"></div>
    );
  } else if (loadingState === 2) {
    return (
      <div className="w-lvw h-lvh flex items-center justify-center bg-[var(--bg-yellow-white)] flex-col">
        <div className="rounded-lg overflow-hidden">
          <Image
            src={
              "https://media1.tenor.com/m/Lh66qN7XymwAAAAC/kumala-savesta.gif"
            }
            alt="jake sigma loading gif"
            width={300}
            height={0}
          />
        </div>
        <div className="text-center font-medium">Loading...</div>
      </div>
    );
  } else if (loadingState === 3) {
    return (
      <div className="w-lvw h-lvh flex items-center justify-center bg-[var(--bg-yellow-white)]">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-row gap-4 w-[700px] items-end">
            {videoDisplayed === "jake-sigma" ? (
              <div className="w-[200px]">
                <VideoPlayer
                  url="https://www.youtube.com/watch?v=10gjsgA6fTE&p"
                  aspectRatio="8/16"
                  className="rounded-lg"
                  autoPlay={true}
                  controls={true}
                  clipStartTime={20}
                  muted={true}
                  loop={true}
                />
              </div>
            ) : videoDisplayed === "gta-6" ? (
              <div className="w-full">
                <VideoPlayer
                  url="https://www.youtube.com/watch?v=10gjsgA6fTE&p"
                  className="rounded-lg"
                  aspectRatio="16/9"
                  autoPlay={true}
                  controls={true}
                  clipStartTime={20}
                  muted={true}
                  loop={true}
                />
              </div>
            ) : null}
          </div>
          <div className="text-center font-medium">
            Sorry for the long wait time. <br /> Here's some gameplay to keep
            you entertained 🙏.
          </div>
          <div className=""></div>
          <DropdownMenu>
            <DropdownMenuTrigger>Pick your Rot</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setVideoDisplayed("jake-sigma")}>
                Jake sigma
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVideoDisplayed("gta-6")}>
                Sigma gta 6
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }
}
*/