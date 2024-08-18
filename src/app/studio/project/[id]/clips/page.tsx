"use client";

import { processMediaIntoClipsAndUserMinutesAnalyzedLogic } from "@/actions/processMedia/processMediaIntoClipsAndMinutesAnalyzedLogic";
import { TClip, TProject } from "@/app/studio/types";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebase";
import { UserAuth } from "@/context/AuthContext";
import { useProjectsContext } from "@/context/ProjectsContext";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect } from "react";

export default function StudioProjectClipsPage() {
  const { user } = UserAuth() as { user: any };
  const { project, fetchingProjectState, clips } = useProjectsContext() as {
    project: TProject,
    fetchingProjectState: boolean,
    clips: Array<TClip>,
  };
  //media collection. when video processed into clips, it is displayed there as a doc with array of TClip types.
  //users can regenerate those clisp for a video as every user can access that video's clips in the db
  // asdfasd.com/mp4 : [TClip, TClip, { url: asdfasdfCLIP.mp4S3, name: ...}]

  useEffect(() => {
    const processMediaProps = {
      userEmail: user.email,
      mediaURL: "",
      reanalyze: false
    }
    processMediaIntoClipsAndUserMinutesAnalyzedLogic(processMediaProps) 

    //still need to analyze media hr by hr, and make option to anaylyze more and all serverside logic w that
    const processMediaIntoClips = async () => {
      
    }


    //checkIfMediaIsProcessed()
    //if no, process media send process to aws
    // if yes, fetch clips
  },[])

  if (fetchingProjectState) {
    return (
      <main className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 text-lg w-fit">
          <div className="font-medium">Loading video information...</div>
          <i className="fa-solid fa-spinner animate-spin"></i>
        </div>
      </main>
    )
  }
  const transcript = "adsf as df a sdfas df a sdfasdfasdf  asd f asdf asd fa sdfas df asd fas df as dfasd f asd asd f asdf asdf asdfasdfasdfasd  sfasdfa sd fasd f as df as"
  return (
    <main className="flex flex-col items-center justify-center">
      <div className="space-y-14">
        <nav className="w-fit items-start space-y-2">
          <div className="flex gap-3 text-3xl">
            <div className="font-semibold">
              {`Shorts for ${project?.name}`}
              <span className="ml-2">
                <Link href={project?.media.url?? ""}>
                  <i className="fa-solid fa-up-right-from-square text-[var(--salmon-orange)]"></i>
                </Link>
              </span>
            </div>
          </div>
          <div className="text-lg text-[var(--slight-gray)]">Here are the highlighted clips of the video, pick your favorite one</div>
        </nav>

        <div className="grid gap-6 bg-[var(--bg-white)] rounded-lg
          grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 w-fit">
          {clips.map((clip) => {
            return (
              <div
                className="bg-[var(--bg-white)] rounded-md
                transition fade-in-5 border-2 relative max-w-[380px] min-w-[300px]
                group/card space-y-8 px-5 py-8"
                key={clip.title + clip.url}
              >
                <div className="space-y-5 text-lg">
                  <div className="font-medium line-clamp-1 text-ellipsis text-sm">The Danger of Advanced AI Technology</div>
                  <div className="w-full line-clamp-2 text-ellipsis">{transcript}</div>
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
                    <i className="fa-solid fa-play text-xs text-[var(--salmon-orange)]
                    group-hover/card-button:text-[var(--bg-white)] leading-none"></i>
                  </Button>
                </div>
              </div>            
            )
          })}
        </div>

        <div className="flex items-center gap-3 text-lg w-fit">
          <div className="font-medium">Want new clips?</div>
          <Button className="cursor-pointer bg-gradient-to-br from-[#ff9636] via-[var(--salmon-orange)] 
          to-[#ff7936] text-lg">
            Regenerate Clips Here
          </Button>
        </div>
      </div>
    </main>
  );
}


