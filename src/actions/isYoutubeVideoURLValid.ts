"use server";

import ytdl from "@distube/ytdl-core"

export async function isYoutubeVideoURLValid(mediaURL: string) {
  try {
    return ytdl.validateURL(mediaURL)
  } catch (error) {
    console.error("Error in isYoutubeVideoURLValid", error)
    return false
  }
}