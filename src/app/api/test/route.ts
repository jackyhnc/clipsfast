import { getYoutubeInfo } from "@/actions/getYoutubeInfo";
import { isYoutubeVideoURLFormat, isYoutubeVideoURLValid } from "@/actions/isYoutubeVideoURLValid";
import { processMediaIntoClips } from "@/actions/processMedia/processMediaIntoClips";
import { TClip } from "@/app/studio/types";
import ytdl from "@distube/ytdl-core";
import { AssemblyAI } from "assemblyai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  /*
  const clip: TClip = {
    id: "0981234--23-42-3-123",
    mediaURL: "https://www.youtube.com/watch?v=k3VbMdmGmIo",
    time: {
      start: 230,
      end: 235,
    },
    title: "The clip!!",
    transcript: "asdf",
    creationTime: 1123124,
    transcriptID:"7b9e00dc-552f-4a47-8a99-aa8113250513"
  };

  const directURLs = await getIdealYoutubeVideoAndAudioURLs({url:clip.mediaURL, minimumVideoAndAudioItags: [18]});

  await processClip({ clip, clipEditConfig: { brainrotClip: { "fortnite-clip": 1 } }, directURLs });

  */
  return NextResponse.json("success");
}
