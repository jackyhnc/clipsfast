"use client";
import { UserAuth } from "@/context/AuthContext";
import { TClipProcessed, TUser } from "../types";
import Image from "next/image";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default async function ClipsProcessedHistoryPage() {
  //const { user, userData } = UserAuth() as { user: any; userData: TUser | undefined };
  const clips: Array<TClipProcessed> = [
    {
      id: "k1lj2n3kj1n2k3j",
      title: "cool ass clip lkajsdfajs;dfas",
      transcript:
        "transcrip tcool ass transcript OMGGG transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript ",
      time: {
        start: 0,
        end: 10,
      },
      url: "s3/asdfasdfasdf.com/mp3",
      creationTime: Date.now(),
      thumbnail:
        "https://clipsfast.s3.amazonaws.com/public/284BA690-EB16-4797-AD1B-0BE65F1FCC2C_1_201_a.jpeg",
    },
    {
      id: "k1lj2n3kj1n2k3j",
      title: "cool ass clip lkajsdfajs;dfas",
      transcript:
        "transcrip tcool ass transcript OMGGG transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript ",
      time: {
        start: 0,
        end: 10,
      },
      url: "s3/asdfasdfasdf.com/mp3",
      creationTime: Date.now(),
      thumbnail:
        "https://clipsfast.s3.amazonaws.com/public/284BA690-EB16-4797-AD1B-0BE65F1FCC2C_1_201_a.jpeg",
    },
    {
      id: "k1lj2n3kj1n2k3j",
      title: "cool ass clip lkajsdfajs;dfas",
      transcript:
        "transcrip tcool ass transcript OMGGG transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript ",
      time: {
        start: 0,
        end: 10,
      },
      url: "s3/asdfasdfasdf.com/mp3",
      creationTime: Date.now(),
      thumbnail:
        "https://clipsfast.s3.amazonaws.com/public/284BA690-EB16-4797-AD1B-0BE65F1FCC2C_1_201_a.jpeg",
    },
    {
      id: "k1lj2n3kj1n2k3j",
      title: "cool ass clip lkajsdfajs;dfas",
      transcript:
        "transcrip tcool ass transcript OMGGG transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript ",
      time: {
        start: 0,
        end: 10,
      },
      url: "s3/asdfasdfasdf.com/mp3",
      creationTime: Date.now(),
      thumbnail:
        "https://clipsfast.s3.amazonaws.com/public/284BA690-EB16-4797-AD1B-0BE65F1FCC2C_1_201_a.jpeg",
    },
    {
      id: "k1lj2n3kj1n2k3j",
      title: "cool ass clip lkajsdfajs;dfas",
      transcript:
        "transcrip tcool ass transcript OMGGG transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript ",
      time: {
        start: 0,
        end: 10,
      },
      url: "s3/asdfasdfasdf.com/mp3",
      creationTime: Date.now(),
      thumbnail:
        "https://clipsfast.s3.amazonaws.com/public/284BA690-EB16-4797-AD1B-0BE65F1FCC2C_1_201_a.jpeg",
    },
    {
      id: "k1lj2n3kj1n2k3j",
      title: "cool ass clip lkajsdfajs;dfas",
      transcript:
        "transcrip tcool ass transcript OMGGG transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript transcrip tcool ass transcript ",
      time: {
        start: 0,
        end: 10,
      },
      url: "s3/asdfasdfasdf.com/mp3",
      creationTime: Date.now(),
      thumbnail:
        "https://clipsfast.s3.amazonaws.com/public/284BA690-EB16-4797-AD1B-0BE65F1FCC2C_1_201_a.jpeg",
    },
  ];
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
        <div className="flex gap-x-8 bg-[var(--bg-white)] flex-col gap-2 rounded-lg overflow-x-scroll bg-gray-200 borde">
          {clips.map((clip) => {
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
              <div className="flex">
                <div className="h-[90px] w-[50px] relative">
                  <Image
                    src={clip.thumbnail}
                    alt="project thumbnail"
                    fill
                    className="w-full rounded-sm object-cover cursor-pointer"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="">{clip.title ?? "Untitled"}</div>
                  <div className="">{clip.transcript ?? "No Transcript"}</div>
                  <div className="flex gap-1 items-center text-xs text-[var(--slight-gray)]">
                    <i className="fa-regular fa-clock"></i>
                    <div className="divide-x divide-[var(--slight-gray)] flex items-center">
                      <div className="pr-1">{`${duration} seconds`}</div>
                      <div className="pl-1 hidden sm:block">{`${startTimestamp} to ${endTimestamp}`}</div>
                    </div>
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
