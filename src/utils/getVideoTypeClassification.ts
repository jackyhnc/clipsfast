import { TMedia } from "@/app/studio/types";
import { isYoutubeVideoURLValid } from "../actions/isYoutubeVideoURLValid";

export async function getVideoTypeClassification(mediaURL: string) {
  const videoClass: TMedia["type"] = (await isYoutubeVideoURLValid(mediaURL)) ? "youtube" : "hosted";
  return videoClass
}
