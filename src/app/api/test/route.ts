import { isYoutubeVideoURLFormat, isYoutubeVideoURLValid } from "@/actions/isYoutubeVideoURLValid";
import { processMediaIntoClips } from "@/actions/processMedia/processMediaIntoClips";
import ytdl from "@distube/ytdl-core";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const mediaURL = "https://youtube.com/v/dQw4w9WgXcQ?feadsfature=youtube_gdatasdfasdfa_player";

  console.log(await isYoutubeVideoURLFormat(mediaURL))

  return NextResponse.json(await isYoutubeVideoURLValid(mediaURL))
}
