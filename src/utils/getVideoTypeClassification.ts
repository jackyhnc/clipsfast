import { TMedia } from "@/app/studio/types";
import { isYoutubeVideoURL } from "./isYoutubeVideoURL";

export function getVideoTypeClassification(mediaURL: string) {
  const videoClass: TMedia["type"] = isYoutubeVideoURL(mediaURL) ? "youtube" : "hosted";
  return videoClass
}
