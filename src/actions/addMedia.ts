"use server"

import { TMedia } from "@/app/studio/types";
import { db } from "@/config/firebase";
import { getVideoTypeClassification } from "@/utils/getVideoTypeClassification";
import { isYoutubeVideoURL } from "@/utils/isYoutubeVideoURL";
import { sanitizeMediaURL } from "@/utils/sanitizeMediaURL";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getYoutubeInfo } from "./getYoutubeInfo";

export async function addMedia(mediaURL: string) {
  const mediaDocRef = doc(db, "media", sanitizeMediaURL(mediaURL));
  
  const mediaDoc = await getDoc(mediaDocRef);
  if (mediaDoc.exists()) {
    console.warn("Media already exists.")
    return
  }

  const newMedia: TMedia = {
    url: mediaURL,

    type: getVideoTypeClassification(mediaURL),
    clips: [], 

    percentAnalyzed: 0,
  }
  setDoc(mediaDocRef, newMedia);

  return {
    newMedia,
    reference: mediaDocRef,
  }
}
