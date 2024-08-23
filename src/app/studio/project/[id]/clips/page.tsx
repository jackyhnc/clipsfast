"use client";

import { processMediaIntoClipsAndUserMinutesAnalyzedLogic } from "@/actions/processMedia/processMediaIntoClipsAndMinutesAnalyzedLogic";
import { TClip, TMedia, TProject } from "@/app/studio/types";
import { Button } from "@/components/ui/button";
import { UserAuth } from "@/context/AuthContext";
import { useProjectsContext } from "@/context/ProjectsContext";
import Link from "next/link";
import { useEffect } from "react";

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

  const handleGenerateClips = ({ reanalyze }: { reanalyze: boolean }) => {
    const props = {
      mediaURL: media.url,
      userEmail: user.email,
      reanalyze,
    };
    processMediaIntoClipsAndUserMinutesAnalyzedLogic(props);
  };
  function GenerateClipsSection() {
    let reanalyze = false;
    if (media.percentAnalyzed === 1) {
      reanalyze = true;
    }

    return (
      <div className="flex items-center gap-3 text-lg w-fit">
        <div className="font-medium">
          {reanalyze ? "Want to see fresh clips?" : `${media.percentAnalyzed}% analyzed`}
        </div>
        <Button
          className="cursor-pointer bg-gradient-to-br from-[#ff9636] via-[var(--salmon-orange)] 
  to-[#ff7936] text-lg"
          onClick={() => handleGenerateClips({ reanalyze })}
        >
          Analyze more
        </Button>
      </div>
    );
  }

  function ClipsSection() {
    return (
      <div
        className="grid gap-6 bg-[var(--bg-white)] rounded-lg
      grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 w-fit"
      >
        {media.clips.map((clip) => {
          return (
            <div
              className="bg-[var(--bg-white)] rounded-md
                transition fade-in-5 border-2 relative max-w-[380px] min-w-[300px]
                group/card space-y-8 px-5 py-8"
              key={clip.title + clip.url}
            >
              <div className="space-y-5 text-lg">
                <div className="font-medium line-clamp-1 text-ellipsis text-sm">
                  The Danger of Advanced AI Technology
                </div>
                <div className="w-full line-clamp-2 text-ellipsis">{clip.transcript ?? ""}</div>
              </div>
              <div className="text-sm text-[var(--slight-gray)] flex gap-2 items-center justify-between">
                <div className="flex gap-2 items-center text-xs">
                  <i className="fa-regular fa-clock"></i>
                  <div className="divide-x divide-[var(--slight-gray)] flex items-center">
                    <div className="pr-2">30 seconds</div>
                    <div className="pl-2">0:30 - 1:00</div>
                  </div>
                </div>
                <Button
                  variant={"outline"}
                  className="transition ease-in bg-[var(--bg-white)] border-[var(--salmon-orange)]
                    hover:bg-[var(--salmon-orange)] group/card-button leading-none"
                >
                  <i
                    className="fa-solid fa-play text-xs text-[var(--salmon-orange)]
                    group-hover/card-button:text-[var(--bg-white)] leading-none"
                  ></i>
                </Button>
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
        <nav className="w-fit items-start space-y-2">
          <div className="flex gap-3 text-3xl">
            <div className="font-semibold">
              {`Shorts for ${project?.name}`}
              <span className="ml-2">
                <Link href={project?.media.url ?? ""}>
                  <i className="fa-solid fa-up-right-from-square text-[var(--salmon-orange)]"></i>
                </Link>
              </span>
            </div>
          </div>
          <div className="text-lg text-[var(--slight-gray)]">
            Here are the highlighted clips of the video, pick your favorite one
          </div>
        </nav>

        <ClipsSection />
        <GenerateClipsSection />
      </div>
    </main>
  );
}
