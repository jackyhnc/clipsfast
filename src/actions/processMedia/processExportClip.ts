"use server";

import { TClip, TClipProcessed, TUser } from "@/app/studio/types";
import { db } from "@/config/firebase";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";

async function processClip({ clip }: { clip: TClip }) {
  const processedClip: TClipProcessed = {
    ...clip,
    thumbnail: "asdfasdfasdfasdfasdf /////////",
  };
  return {
    processedClip,
  };
}

export async function processExportClip({ clip, userEmail }: { clip: TClip; userEmail: string }) {
  const userDocRef = doc(db, "users", userEmail);
  const userDocData = (await getDoc(userDocRef)).data();
  const userDoc: TUser = {
    email: userDocData?.email,
    name: userDocData?.name,
    projectsIDs: userDocData?.projectsIDs,
    userPlan: userDocData?.userPlan,
    minutesAnalyzedThisMonth: userDocData?.minutesAnalyzedThisMonth,
    lifetimeMinutesAnalyzed: userDocData?.lifetimeMinutesAnalyzed,
    actionsInProgress: userDocData?.actionsInProgress ?? [],
    clipsInProgress: userDocData?.clipsInProgress ?? [],
    clipsProcessed: userDocData?.clipsProcessed ?? [],
  };

  const maxAmountOfClipsUserCanProcess = 15;
  if (userDoc.clipsInProgress.length >= maxAmountOfClipsUserCanProcess) {
    throw new Error("You have reached the max amount of clips in progress. Please try again later.");
  }

  if (userDoc.clipsInProgress.includes(clip)) {
    throw new Error("You are already processing this clip. Please try again later.");
  }
  if (userDoc.clipsProcessed.map((clip) => clip.id).includes(clip.id)) {
    throw new Error("You already processed this clip. Find it in your clips history tab.");
  }

  await updateDoc(userDocRef, {
    clipsInProgress: arrayUnion(clip),
  });

  //process the clip
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const { processedClip }: { processedClip: TClipProcessed } = await processClip({
    clip,
  });

  await updateDoc(userDocRef, {
    clipsInProgress: arrayRemove(clip),
    clipsProcessed: arrayUnion(processedClip),
  });

  return;
}
