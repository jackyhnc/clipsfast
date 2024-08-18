import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";


export async function checkMediaProcessedPercentage(mediaURL: string) {
  const mediaDocRef = doc(db, "media", mediaURL);
  const mediaDoc = (await getDoc(mediaDocRef)).data();

  const percentAnalyzed: number = mediaDoc?.percentAnalyzed

  return percentAnalyzed
}