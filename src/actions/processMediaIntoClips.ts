"use server"

import { TClip } from "@/app/studio/types";
import { db } from "@/config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function processMediaIntoClips(mediaURL: string, userEmail: string) {
  //make more secure bc i dont want someone on client to trigger this server function with not their 
  //userEmail somehow and using someone else's account's minutes analyzed credits

  const userDocRef = doc(db, "users", userEmail);
  const userDoc = (await getDoc(userDocRef)).data();
  const userPlan = userDoc?.userPlan;
  const minutesAnalyzed = userDoc?.minutesAnalyzed;
  let minutesProvided = 0;

  switch (userPlan) {
    case "free":
      minutesProvided = 60;
      break;
    case "lite":
      minutesProvided = 900;
      break;
    case "pro":
      minutesProvided = 2100;
      break;
    case "max":
      minutesProvided = 9000;
      break;
    /*
    case "enterprise":
      minutesProvided = 10000; //idk yet
      break;
    */
  }

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

  return clips
}