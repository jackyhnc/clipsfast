"use client";

import { processMediaIntoClips } from "@/actions/processMedia/processMediaIntoClips";
import { processMediaIntoClipsAndUserMinutesAnalyzedLogic } from "@/actions/processMedia/processMediaIntoClipsAndMinutesAnalyzedLogic";
import { TClip, TMedia, TProject } from "@/app/studio/types";
import { Button } from "@/components/ui/button";
import { UserAuth } from "@/context/AuthContext";
import { useProjectsContext } from "@/context/ProjectsContext";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VideoPlayer from "@/components/VideoPlayer";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

export default function StudioProjectClipsPage() {
  const { user } = UserAuth() as { user: any };
  const { project, fetchingProjectState, media, fetchingMediaState } = useProjectsContext() as {
    project: TProject;
    fetchingProjectState: boolean;

    media: TMedia;
    fetchingMediaState: boolean;
  };

  if (fetchingProjectState || fetchingMediaState) {
    return (
      <main className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 text-lg w-fit">
          <div className="font-medium">Loading video information...</div>
          <i className="fa-solid fa-spinner animate-spin"></i>
        </div>
      </main>
    );
  }

  // return this if media somehow doesn't exist
  if (!media) {
    console.warn("No media found. Media should have been created upon creating the project.");
    return (
      <main className="flex flex-col items-center justify-center max-w-[700px] mx-auto">
        <div className="flex items-center text-lg w-fit flex-col font-medium">
          <div className="">No media found. Media should have been created upon creating the project.</div>
          <div className="">Try deleting this project and start another using the same video link.</div>
        </div>
      </main>
    );
  }

  function GenerateClipsSection() {
    const handleGenerateClips = async ({
      reanalyze,
      e,
      editConfig
    }: {
      reanalyze: boolean;
      e?: any;
      editConfig?: {
        clipsLengthInSeconds: number;
        clipsContentPrompt: string;
        clipsTitlePrompt: string;
      }
    }) => {
      setIsGeneratingClips(true);
      const props = {
        mediaURL: media.url,
        userEmail: user.email,
        reanalyze,
        editConfig: editConfig ?? {},
      };
      
      e?.preventDefault();
      
      try {
        await processMediaIntoClipsAndUserMinutesAnalyzedLogic(props);
        //await new Promise(resolve => setTimeout(resolve, 100000));
      } catch (error) {
        setIsGeneratingClips(false);
        throw new Error("Something went wrong. Please try again.");
      }
      setIsGeneratingClips(false);
    };

    let reanalyze = false;
    if (media.percentAnalyzed === 1) {
      reanalyze = true;
    }

    const [isGeneratingClips, setIsGeneratingClips] = useState(false);

    const [generatingClipProgress, setGeneratingClipsProgress] = useState(0);
    //add bs to progress bar
    useEffect(() => {
      if (isGeneratingClips) {
        let howMuchProgressToAdd = Math.ceil(Math.random() * 4);
        let intervalInMiliseconds = Math.round(Math.random() * 10000);

        setTimeout(() => {
          setGeneratingClipsProgress((prev) => prev + howMuchProgressToAdd);
        }, intervalInMiliseconds);
      }
    }, [isGeneratingClips, generatingClipProgress, setGeneratingClipsProgress]);

    const [buttonText, setButtonText] = useState("Analyze More");
    //choose analyze button text
    useEffect(() => {
      if (isGeneratingClips) {
        setButtonText("Please wait");
      } else if (reanalyze) {
        setButtonText("Reanalyze Video");
      }
    }, [isGeneratingClips, reanalyze]);

    function GenerateClipsOptionsForm() {
      const [clipsLengthInSeconds, setClipsLengthInSeconds] = useState(60);
      const [clipsContentPrompt, setClipsContentPrompt] = useState("");
      const [clipsTitlePrompt, setClipsTitlePrompt] = useState("");

      return (
        <form
          className="space-y-6"
          onSubmit={(e) =>
            handleGenerateClips({
              reanalyze,
              e,
              editConfig: {
                clipsLengthInSeconds,
                clipsContentPrompt,
                clipsTitlePrompt,
              },
            })
          }
        >
          <div className="space-y-2">
            <Label>Prompt for clips&apos; content</Label>
            <Input
              value={clipsContentPrompt}
              onChange={(e) => setClipsContentPrompt(e.target.value)}
              placeholder={"Must be informing, engaging, funny moments"}
            />
          </div>

          <div className="space-y-2">
            <Label>Prompt for clips&apos; title</Label>
            <Input
              value={clipsTitlePrompt}
              onChange={(e) => setClipsTitlePrompt(e.target.value)}
              placeholder={"Must be interesting, eye-catching, suprising, emojis allowed"}
            />
          </div>

          <div className="space-y-2">
            <Label>Approximate length of clips</Label>
            <Slider
              value={[clipsLengthInSeconds]}
              onValueChange={(value) => setClipsLengthInSeconds(value[0])}
              max={100}
              step={1}
            />
            <div className="text-sm text-[var(--slight-gray)]">{`${clipsLengthInSeconds} seconds`}</div>
          </div>

          <div className="w-full flex justify-end">
            <Button
              className="bg-[var(--salmon-orange)] text-sm sm:text-lg"
              disabled={isGeneratingClips}
              type="submit"
            >
              {buttonText}
              {isGeneratingClips ? (
                <i className="fa-solid fa-spinner animate-spin text-[var(--bg-white)] ml-2"></i>
              ) : (
                <i className="fa-solid fa-wand-magic-sparkles text-[var(--bg-white)] ml-2"></i>
              )}
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div
        className="border-2 border-[var(--salmon-orange)] rounded-lg py-12 flex items-center 
      justify-center flex-col space-y-4
      bg-[var(--light-salmon-orange)] text-center min-w-[250px] px-10"
      >
        <div className="font-medium text-lg">
          {isGeneratingClips ? "Generating clips..." : `${Math.ceil(media.percentAnalyzed * 100)}% analyzed. ${
            reanalyze ? "Wanna see fresh new clips?" : ""
          }`}
        </div>
        <div className="flex flex-col space-y-2">
          <Button className="bg-[var(--salmon-orange)] text-sm sm:text-lg" disabled={isGeneratingClips} onClick={() => handleGenerateClips({ reanalyze })}>
            {buttonText}
            {isGeneratingClips ? (
              <i className="fa-solid fa-spinner animate-spin text-[var(--bg-white)] ml-2"></i>
            ) : (
              <i className="fa-solid fa-wand-magic-sparkles text-[var(--bg-white)] ml-2"></i>
            )}
          </Button>
          <Dialog>
            <DialogTrigger>
              <div className="text-sm text-[var(--slight-gray)] underline hover:text-black transition">
                Advanced Options
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Advanced options for generating clips</DialogTitle>
              </DialogHeader>
              <GenerateClipsOptionsForm />
            </DialogContent>
          </Dialog>
        </div>

        {isGeneratingClips && (
          <>
            <Progress value={generatingClipProgress} className="w-[60%]" />
          </>
        )}
        <div className="text-xs sm:text-sm text-[var(--slight-gray)] flex items-center max-w-[350px]">
          <div className="text-center">Processing in the background. You will be emailed when finished.</div>
        </div>
      </div>
    );
  }

  function ClipsSection() {
    return (
      <div
        className="grid gap-x-8 gap-y-10 bg-[var(--bg-white)] rounded-lg
      grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 w-fit"
      >
        {media.clips.map((clip) => {
          function getFormatSecondsToTimestamp(seconds: number) {
            const minute = Math.floor(seconds / 60)
              .toString()
              .padStart(2, "0");
            const second = (seconds % 60).toString().padStart(2, "0");
            return `${minute}:${second}`;
          }

          const startTimestamp = getFormatSecondsToTimestamp(clip.time.start);
          const endTimestamp = getFormatSecondsToTimestamp(clip.time.end);

          const duration = clip.time.end - clip.time.start;
          return (
            <div
              className="bg-[var(--bg-white)] rounded-lg
                transition fade-in-5 border-2 relative min-w-[250px] lg:max-w-[380px] lg:min-w-[300px]
                group/card px-6 hover:border-[var(--light-gray)] flex flex-col justify-between
                w-full py-6 space-y-8"
              key={clip.title + clip.url}
            >
              <div className="space-y-4">
                <div className="line-clamp-2 text-sm text-ellipsis text-[var(--slight-gray)]">
                  {clip.title}
                </div>
                <div className="w-full line-clamp-2 text-ellipsis text-2xl font-medium">
                  {clip.transcript ?? ""}
                </div>
              </div>
              <div className="text-sm text-[var(--slight-gray)] flex items-center justify-between">
                <div className="flex gap-2 items-center text-sm">
                  <i className="fa-regular fa-clock"></i>
                  <div className="divide-x divide-[var(--slight-gray)] flex items-center">
                    <div className="pr-2">{`${duration} seconds`}</div>
                    <div className="pl-2 hidden sm:block">{`${startTimestamp} to ${endTimestamp}`}</div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant={"outline"}
                      size={"sm"}
                      className="transition ease-in bg-[var(--bg-white)] border-[var(--salmon-orange)]
                    hover:bg-[var(--salmon-orange)] group/card-button leading-none border-2"
                    >
                      <i
                        className="fa-solid fa-play text-sm text-[var(--salmon-orange)]
                    group-hover/card-button:text-[var(--bg-white)] leading-none"
                      ></i>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] overflow-auto py-0">
                    <div className="p-8">
                      <div className="text-center text-xl font-medium pb-6">{clip.title}</div>

                      <div className="space-y-4">
                        <VideoPlayer
                          url={media.url}
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
                          <Button className="bg-[var(--salmon-orange)] justify-end">Select Clip</Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center">
      <div className="space-y-14">
        <nav className="w-fit items-start space-y-4">
          <div className="flex gap-3 text-3xl">
            <div className="font-semibold">
              {`Clips for "${project?.name}"`}
              <span className="ml-2">
                <Link href={project?.media.url ?? ""}>
                  <i className="fa-solid fa-up-right-from-square text-[var(--salmon-orange)]"></i>
                </Link>
              </span>
            </div>
          </div>
          <div className="text-lg text-[var(--slight-gray)]">
            Here are the highlighted clips of the video, pick your favorite ones ❤️
          </div>
        </nav>

        <ClipsSection />
        <GenerateClipsSection />
      </div>
    </main>
  );
}
