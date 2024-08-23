import { getYoutubeInfo } from "@/actions/getYoutubeInfo";
import Ffmpeg from "fluent-ffmpeg";
import { NextRequest, NextResponse } from "next/server";

async function getVideoDuration(props: any) {
  const { mediaURL, videoType } = props;

  let durationInSeconds = 0;

  if (videoType === "youtube") {
    const youtubeInfo = await getYoutubeInfo(mediaURL);
    durationInSeconds = Number(youtubeInfo.durationInSeconds);
  } else if (videoType === "hosted") {
    durationInSeconds = await getHostedVideoDuration(mediaURL);
  }

  return durationInSeconds;

  async function getHostedVideoDuration(videoUrl: string) {
    try {
      const duration: number = await new Promise((resolve, reject) => {
        Ffmpeg.ffprobe(videoUrl, (err, metadata) => {
          if (err) {
            reject(err);
          } else {
            resolve(metadata.format.duration as any);
          }
        });
      });
      return duration;
    } catch (error: any) {
      error.message = "Error retrieving video duration: " + error.message;
      console.error(error);
      throw error;
    }
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  const durationInSeconds = await getVideoDuration({
    mediaURL: "https://www.youtube.com/watch?v=5nXQW9nKQxM",
    videoType: "youtube",
  });
  return NextResponse.json(durationInSeconds);
}
