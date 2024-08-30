"use server"

import { db } from "@/config/firebase";
import { sanitizeMediaURL } from "@/utils/sanitizeMediaURL";
import { doc, getDoc } from "firebase/firestore";

export async function checkMediaProcessedPercentage(mediaURL: string) {
  const mediaDocRef = doc(db, "media", await sanitizeMediaURL(mediaURL));
  const mediaDoc = (await getDoc(mediaDocRef)).data();

  const percentAnalyzed: number = mediaDoc?.percentAnalyzed

  return percentAnalyzed
}