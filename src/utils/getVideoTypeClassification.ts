import { TMedia } from "@/app/studio/types";
import { isYoutubeVideoURLFormat } from "../actions/isYoutubeVideoURLValid";

export async function getVideoTypeClassification(mediaURL: string) {
  const videoClass: TMedia["type"] = (await isYoutubeVideoURLFormat(mediaURL)) ? "youtube" : "hosted";
  return videoClass
}
