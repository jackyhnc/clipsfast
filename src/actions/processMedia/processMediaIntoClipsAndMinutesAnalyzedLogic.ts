"use server";

import { TActionInProgress, TClip, TMedia, TUser } from "@/app/studio/types";
import { db } from "@/config/firebase";
import { arrayRemove, arrayUnion, doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore";
import { getUserPlanMinutes } from "@/utils/getUserPlanMinutes";
import { sanitizeMediaURL } from "@/utils/sanitizeMediaURL";
import { getYoutubeInfo } from "../getYoutubeInfo";
import Ffmpeg from "fluent-ffmpeg";
import { processMediaIntoClips } from "./processMediaIntoClips";

async function getVideoDuration({ mediaURL, videoType }: { mediaURL: string; videoType: TMedia["type"] }) {
  let durationInSeconds: number = 0;

  if (videoType === "youtube") {
    const youtubeInfo = await getYoutubeInfo(mediaURL);
    durationInSeconds = Number(youtubeInfo.durationInSeconds);
  } else if (videoType === "hosted") {
    durationInSeconds = await getHostedVideoDuration(mediaURL);
  }

  return durationInSeconds;

  async function getHostedVideoDuration(videoUrl: string) {
    try {
      const duration: number = await new Promise((resolve, reject) => {
        Ffmpeg.ffprobe(videoUrl, (err, metadata) => {
          if (err) {
            reject(err);
          } else {
            resolve(metadata.format.duration as any);
          }
        });
      });
      return duration;
    } catch (error: any) {
      error.message = "Error retrieving video duration: " + error.message;
      console.error(error);
      throw error;
    }
  }
}

function calculatePercentToBeAnalyzed({
  percentAlreadyAnalyzed,
  durationInSeconds,
}: {
  durationInSeconds: number;
  percentAlreadyAnalyzed: number;
}) {
  const durationInMinutes = durationInSeconds / 60;

  const minutesAlreadyAnalyzed = percentAlreadyAnalyzed * durationInMinutes;

  let minutesToAnalyze = 0;

  if (minutesAlreadyAnalyzed >= 60) {
    minutesToAnalyze = 180;
  } else {
    minutesToAnalyze = 60;
  }

  if (durationInMinutes > 600) {
    throw new Error("Video is too long.");
  }

  if (minutesToAnalyze > durationInMinutes) {
    minutesToAnalyze = durationInMinutes;
  }

  return {
    percentToBeAnalyzed: minutesToAnalyze / durationInMinutes,
    minutesToAnalyze,
  };
}

export async function processMediaIntoClipsAndUserMinutesAnalyzedLogic({
  mediaURL,
  userEmail,
  reanalyze = false,
  editConfig: { clipsLengthInSeconds, clipsContentPrompt, clipsTitlePrompt },
}: {
  mediaURL: string;
  userEmail: string;
  reanalyze?: boolean;
  editConfig: {
    clipsLengthInSeconds?: number;
    clipsContentPrompt?: string;
    clipsTitlePrompt?: string;
  };
}) {
  //make more secure bc i dont want someone on client to trigger this server function with not their
  //userEmail somehow and using someone else's account's minutes analyzed credits

  const userDocRef = doc(db, "users", userEmail);
  const userDocSnapData = (await getDoc(userDocRef)).data();
  const userDoc: TUser = {
    email: userDocSnapData?.email,
    name: userDocSnapData?.name,
    projectsIDs: userDocSnapData?.projectsIDs,
    userPlan: userDocSnapData?.userPlan,
    minutesAnalyzedThisMonth: userDocSnapData?.minutesAnalyzedThisMonth,
    lifetimeMinutesAnalyzed: userDocSnapData?.lifetimeMinutesAnalyzed,
    actionsInProgress: userDocSnapData?.actionsInProgress ?? [],
    clipsInProgress: userDocSnapData?.clipsInProgress ?? [],
    clipsProcessed: userDocSnapData?.clipsProcessed ?? [],
  };
  const userPlan = userDoc?.userPlan;
  if (!userPlan) {
    throw new Error("User plan not found.");
  }

  const minutesUserAlreadyAnalyzed = userDoc.minutesAnalyzedThisMonth;

  //check if user already analyzing video or they're analyzing over 5 videos. if not, add to their actions in progress
  const actionsInProgress = userDoc.actionsInProgress;
  const videosAlreadyBeingAnalyzed = actionsInProgress.map((action) => action.mediaURLBeingAnalyzed);
  if (videosAlreadyBeingAnalyzed.includes(mediaURL)) {
    throw new Error(`You are already analyzing this video: ${mediaURL}.`);
  }
  const maxAmountOfVideosUserCanAnalyze = 1;
  if (actionsInProgress.length >= maxAmountOfVideosUserCanAnalyze) {
    throw new Error(
      "You have maxed out at 5 videos processing at one time. Please wait for them to process."
    );
  }

  const newActionInProgress: TActionInProgress = {
    mediaURLBeingAnalyzed: mediaURL,
    startTime: Date.now(),
  };
  await updateDoc(userDocRef, {
    actionsInProgress: arrayUnion(newActionInProgress),
  });

  //  await new Promise((resolve) => setTimeout(resolve, 1000))
  // return

  try {
    // add mediaURLBeingAnalyzed to user's actionsInProgress
    const mediaDocRef = doc(db, "media", await sanitizeMediaURL(mediaURL));
    const mediaDocSnapData = (await getDoc(mediaDocRef)).data();
    let mediaDoc: TMedia = {
      url: mediaDocSnapData?.url,
      type: mediaDocSnapData?.type,
      clips: mediaDocSnapData?.clips,
      percentAnalyzed: mediaDocSnapData?.percentAnalyzed,
    };

    // check if user has enough minutes to analyze video
    const minutesProvidedForPlan = getUserPlanMinutes(userPlan);

    if (minutesUserAlreadyAnalyzed >= minutesProvidedForPlan!) {
      throw new Error("User already analyzed to the limit their plan allows for this month.");
    }

    // check if video should be reanalyzed
    const mediaPercentageAnalyzed: number = mediaDoc?.percentAnalyzed;

    if (reanalyze) {
      mediaDoc.percentAnalyzed = 0;
    } else {
      if (mediaPercentageAnalyzed === 1) {
        throw new Error("Video already analyzed to 100% and reanalyze option not chosen.");
      }
    }

    // calculate percent to be analyzed
    const { minutesToAnalyze, percentToBeAnalyzed } = calculatePercentToBeAnalyzed({
      percentAlreadyAnalyzed: mediaDoc?.percentAnalyzed,
      durationInSeconds: await getVideoDuration({ mediaURL, videoType: mediaDoc?.type }),
    });

    // process video into clips
    let clips;
    clips = await processMediaIntoClips({
      mediaURL,
      editConfig: {
        clipsLengthInSeconds,
        clipsContentPrompt,
        clipsTitlePrompt,
      },
      minutesToAnalyze,
    });
    if (!clips) {
      throw new Error("Error processing video into clips.");
    }

    // update media doc values
    mediaDoc.percentAnalyzed = percentToBeAnalyzed;
    mediaDoc.clips = clips;
    console.log(mediaDoc);
    await setDoc(mediaDocRef, mediaDoc);

    // update user minutes analyzed this month & lifetime minutes analyzed & remove this action from user's actions in progress
    const minutesAnalyzedFromVideo = minutesToAnalyze;

    let newMinutesUserAlreadyAnalyzed = minutesUserAlreadyAnalyzed + minutesAnalyzedFromVideo;
    if (newMinutesUserAlreadyAnalyzed >= minutesProvidedForPlan!) {
      console.warn("User's analyze minutes for videos has met its plan limit.");
    }

    await updateDoc(userDocRef, {
      minutesAnalyzedThisMonth: newMinutesUserAlreadyAnalyzed,
      lifetimeMinutesAnalyzed: increment(minutesAnalyzedFromVideo),
      actionsInProgress: arrayRemove(newActionInProgress), //
    });

    // email user analyzing is done

    return clips;
  } catch (error: any) {
    await updateDoc(userDocRef, {
      actionsInProgress: arrayRemove(newActionInProgress),
    });
    throw new Error("Error processing video into clips: " + error.message);
  }
}
