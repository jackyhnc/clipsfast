"use server"

import ytdl from "@distube/ytdl-core";


export async function getYoutubeInfo(url: string) {
  try {
    const youtubeInfo = await ytdl.getInfo(url);

    return {
      title: youtubeInfo.videoDetails.title,
      thumbnails: youtubeInfo.videoDetails.thumbnails,
      description: youtubeInfo.videoDetails.description,
      durationInSeconds: youtubeInfo.videoDetails.lengthSeconds,
      formats: youtubeInfo.formats,
      info: youtubeInfo
    }
  } catch (error: any) {
    throw new Error(error.message + ": Failed to retrieve YouTube video's information.");
  }
}

