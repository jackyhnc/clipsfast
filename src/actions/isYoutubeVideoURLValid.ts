"use server";

import ytdl from "@distube/ytdl-core";

export async function isYoutubeVideoURLFormat(mediaURL: string) {
  return ytdl.validateURL(mediaURL);
}

export async function isYoutubeVideoURLValid(mediaURL: string) {
  if (!(await isYoutubeVideoURLFormat(mediaURL))) {
    return false;
  }

  try {
    await ytdl.getBasicInfo(mediaURL)
    return true
  } catch (error) {
    return false
  }
}
