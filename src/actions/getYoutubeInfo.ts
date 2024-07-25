"use server"

import ytdl from "ytdl-core";

export async function getYoutubeInfo(url: string) {
  try {
    const youtubeInfo = await ytdl.getBasicInfo(url);

    return (
      {
        title: youtubeInfo.videoDetails.title,
        thumbnails: youtubeInfo.videoDetails.thumbnails,
        description: youtubeInfo.videoDetails.description,
      }
    )
  } catch (error) {
    throw new Error("Failed to retrieve YouTube video's information.");
  }
}
