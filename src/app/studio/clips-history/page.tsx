"use client";
import { UserAuth } from "@/context/AuthContext";
import { TClipProcessed, TUser } from "../types";
import Image from "next/image";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

export default function ClipsProcessedHistoryPage() {
  const { user, userData } = UserAuth() as { user: any; userData: TUser | undefined };

  const [processedClips, setProcessedClips] = useState<TClipProcessed[]>([]);

  useEffect(() => {
    setProcessedClips(userData?.clipsProcessed ?? []);
  }, [userData]);

  function getFormatSecondsToTimestamp(seconds: number) {
    const minute = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const second = (seconds % 60).toString().padStart(2, "0");
    return `${minute}:${second}`;
  }
  function ProcessedClipsSection() {
    return (
      <div className="">
        <div className="flex bg-[var(--bg-white)] gap-4 flex-wrap">
          {processedClips.map((clip) => {
            const clipDateObj = new Date(clip.creationTime);
            const clipDate = clipDateObj.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            });

            const startTimestamp = getFormatSecondsToTimestamp(clip.time.start);
            const endTimestamp = getFormatSecondsToTimestamp(clip.time.end);

            const duration = clip.time.end - clip.time.start;

            return (
              <div key={clip.id} className="flex border-2 rounded-md p-4 gap-4 hover:border-[var(--light-gray)] transition-all relative">
                <div className="w-[85px] h-[150px] bg-[var(--slight-gray)] relative rounded-md overflow-hidden">
                  <Image src={clip.thumbnail} alt="project thumbnail" fill />
                </div>
                <div className="flex flex-col w-fit justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-lg break-all line-clamp-1">
                      {clip.title ?? "Untitled"}
                    </div>
                    <div className="line-clamp-2">{clip.transcript ?? "No Transcript"}</div>
                    <div className="flex gap-1 items-center text-xs text-[var(--slight-gray)]">
                      <i className="fa-regular fa-clock"></i>
                      <div className="divide-x divide-[var(--slight-gray)] flex items-center">
                        <div className="pr-1">{`${duration} seconds`}</div>
                        <div className="pl-1 hidden sm:block">{`${startTimestamp} to ${endTimestamp}`}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-end gap-2">
                    <div className="text-xs text-[var(--slight-gray)]">
                      Date Created: {clipDate ?? "No Date Created"}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant={"outline"}
                          size={"sm"}
                          className="transition ease-in bg-[var(--bg-white)] border-[var(--salmon-orange)]
                    hover:bg-[var(--salmon-orange)] group/card-button leading-none border-2"
                        >
                          <div className="flex gap-2 items-center">
                            <i
                              className="fa-solid fa-play text-sm text-[var(--salmon-orange)]
                    group-hover/card-button:text-[var(--bg-white)] leading-none"
                            ></i>
                            <div className="text-[var(--salmon-orange)] group-hover/card-button:text-[var(--bg-white)] transition-all duration-75">
                              View Clip
                            </div>
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] overflow-auto py-0">
                        <div className="p-8">
                          <div className="text-center text-xl font-medium pb-6">{clip.title}</div>

                          <div className="space-y-4">
                            <VideoPlayer
                              url={clip.generatedURL}
                              className="rounded-lg w-[100px] pb-2"
                              clipStartTime={clip.time.start}
                              clipEndTime={clip.time.end}
                              autoPlay={false}
                            />

                            <div className="relative w-full pb-2">
                              <div
                                className="bg-gradient-to-t from-[var(--bg-white)] via-[var(--bg-white)]
                          absolute bottom-2 size-full h-10 z-10"
                              ></div>
                              <ScrollArea className="h-[200px] rounded-md border p-4 w-full z-9">
                                {clip.transcript ?? ""}
                              </ScrollArea>
                            </div>

                            <div className="flex w-full justify-between">
                              <div className="flex gap-2 items-center text-sm text-[var(--slight-gray)]">
                                <i className="fa-regular fa-clock"></i>
                                <div className="divide-x divide-[var(--slight-gray)] flex items-center">
                                  <div className="pr-2">{`${duration} seconds`}</div>
                                  <div className="pl-2 hidden sm:block">{`${startTimestamp} to ${endTimestamp}`}</div>
                                </div>
                              </div>
                              <Button onClick={() => {}} className="bg-[var(--salmon-orange)] justify-end">
                                Select Clip
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            );
            return (
              <div className="relative group/card z-20 min-w-[200px]" key={clip.id}>
                <div
                  className="bg-[var(--bg-white)] w-full p-2 rounded-md hover:shadow-xl hover:scale-[1.01] 
                    transition fade-in-5 border-2 relative cursor-pointer"
                >
                  <div className="aspect-[9/16] relative w-full">
                    {clip.thumbnail ? (
                      <Image
                        src={clip.thumbnail}
                        alt="project thumbnail"
                        fill
                        className="w-full rounded-sm object-cover cursor-pointer"
                      />
                    ) : (
                      <div className="rounded-sm w-[200px] bg-[var(--light-gray)] aspect-[16/9] flex">
                        <i className="fa-solid fa-video text-5xl m-auto text-[var(--bg-white)]" />
                      </div>
                    )}
                  </div>

                  <div className="my-1 w-[200px] space-y-1 mb-5">
                    <div className="font-medium line-clamp-2 text-sm">{clip.title ?? "Untitled"}</div>
                    <div className="flex gap-1 items-center text-xs text-[var(--slight-gray)]">
                      <i className="fa-regular fa-clock"></i>
                      <div className="divide-x divide-[var(--slight-gray)] flex items-center">
                        <div className="pr-1">{`${duration} seconds`}</div>
                        <div className="pl-1 hidden sm:block">{`${startTimestamp} to ${endTimestamp}`}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-[var(--slight-gray)]">
                    Date Created: {clipDate ?? "No Date Created"}
                  </div>
                </div>
                <div className="absolute top-1 right-1">
                  <Dialog>
                    <DialogTrigger className="">
                      <div
                        className="group-hover/card:opacity-100 opacity-0
                        rounded-full hover:bg-[var(--muted-gray)] bg-[var(--bg-white)] border-2 
                        flex transition fade-in p-1 z-10"
                      >
                        <Image src={"/assets/x.svg"} alt="delete project" width={20} height={20} />
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. <br />
                          Project ID: {clip.id}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex w-full justify-center">
                        <Button type="submit" variant="destructive">
                          Delete Project
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className="size-full flex flex-col items-center mt-20">
      <div className="flex flex-col items-center justify-center space-y-14 w-full">
        <nav className="font-semibold text-2xl w-full text-start">Clips History</nav>
        <ProcessedClipsSection />
      </div>
    </div>
  );
}
