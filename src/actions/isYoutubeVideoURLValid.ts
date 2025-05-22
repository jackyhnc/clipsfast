"use server";

import ytdl from "@distube/ytdl-core"

export async function isYoutubeVideoURLValid(mediaURL: string) {
  try {
    const info = await ytdl.getBasicInfo(mediaURL)
    return true
  } catch (error) {
    return false
  }
}