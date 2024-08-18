"use server"

import { TClip } from "@/app/studio/types";
import { db } from "@/config/firebase";
import { getUserMinutesAnalyzed } from "@/utils/getUserMinutesAnalyzed";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { checkMediaProcessedPercentage } from "./checkMediaProcessedPercentage";

type TProps = {
  mediaURL: string, 
  userEmail: string, 
  reanalyze?: boolean
}
export async function processMediaIntoClipsAndUserMinutesAnalyzedLogic(props: TProps) {
  //make more secure bc i dont want someone on client to trigger this server function with not their 
  //userEmail somehow and using someone else's account's minutes analyzed credits

  const { mediaURL, userEmail, reanalyze = false } = props

  const mediaPercentageAnalyzed: number = await checkMediaProcessedPercentage(mediaURL)
  if (mediaPercentageAnalyzed === 1 && !reanalyze) {
    throw new Error("Video already analyzed.")
  }
  const userDocRef = doc(db, "users", userEmail);
  const userDoc = (await getDoc(userDocRef)).data();
  const userPlan = userDoc?.userPlan;
  const minutesAnalyzed = userDoc?.minutesAnalyzed;

  const minutesProvided = getUserMinutesAnalyzed(userPlan)

  if (minutesAnalyzed < minutesProvided) {
    return
  }

  const awsResponse  = await fetch("https://mkpogdgywg.execute-api.us-east-1.amazonaws.com/prod", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mediaURL: mediaURL
    }),
  })

  const responseObj = await awsResponse.json()
  const clips: Array<TClip> = responseObj.clips
  const minutesAnalyzedFromVideo = responseObj.minutesAnalyzedFromVideo

  let newMinutesAnalyzed = minutesAnalyzed - minutesAnalyzedFromVideo
  if (newMinutesAnalyzed < 0) {
    newMinutesAnalyzed = 0
  }
  await updateDoc(doc(db, "users", userEmail), {
    minutesAnalyzed: newMinutesAnalyzed,
  });
  await updateDoc(doc(db, "users", userEmail), {
    lifetimeMinutesAnalyzed: increment(minutesAnalyzedFromVideo),
  });

  return clips
}