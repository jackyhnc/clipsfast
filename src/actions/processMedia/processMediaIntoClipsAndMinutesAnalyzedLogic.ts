"use server";

import { TClip, TMedia } from "@/app/studio/types";
import { db } from "@/config/firebase";
import { doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore";
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
  if (minutesAlreadyAnalyzed < 180) {
    if (minutesAlreadyAnalyzed < 60) {
      minutesToAnalyze = 60;
    }
  } else {
    minutesToAnalyze = 180;
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
  editConfig: {
    clipsLengthInSeconds,
    clipsContentPrompt,
    clipsTitlePrompt,
  }
}: {
  mediaURL: string;
  userEmail: string;
  reanalyze?: boolean;
  editConfig: {
    clipsLengthInSeconds?: number;
    clipsContentPrompt?: string;
    clipsTitlePrompt?: string;
  }
}) {
  //make more secure bc i dont want someone on client to trigger this server function with not their
  //userEmail somehow and using someone else's account's minutes analyzed credits

  const userDocRef = doc(db, "users", userEmail);
  const userDoc = (await getDoc(userDocRef)).data();
  const userPlan = userDoc?.userPlan;
  const minutesUserAlreadyAnalyzed = userDoc?.minutesAnalyzed;

  const mediaDocRef = doc(db, "media", await sanitizeMediaURL(mediaURL));
  let mediaDoc = (await getDoc(mediaDocRef)).data() as TMedia;

  // check if user has enough minutes to analyze video
  const minutesProvidedForPlan = getUserPlanMinutes(userPlan);

  if (minutesUserAlreadyAnalyzed >= minutesProvidedForPlan) {
    throw new Error("User already analyzed to the limit their plan allows for this month.");
  }

  // check if video should be reanalyzed
  const mediaPercentageAnalyzed: number = mediaDoc?.percentAnalyzed;

  if (reanalyze) {
    mediaDoc.percentAnalyzed = 0;
    await updateDoc(mediaDocRef, mediaDoc);
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
  const { clips } = await processMediaIntoClips({
    mediaURL,
    editConfig: {
      clipsLengthInSeconds,
      clipsContentPrompt,
      clipsTitlePrompt,
    },
    minutesToAnalyze,
  });

  mediaDoc.percentAnalyzed = percentToBeAnalyzed;
  mediaDoc.clips = clips;
  console.log(mediaDoc)
  await updateDoc(mediaDocRef, mediaDoc);

  // update user minutes analyzed this month & lifetime minutes analyzed
  const minutesAnalyzedFromVideo = minutesToAnalyze;

  let newMinutesUserAlreadyAnalyzed = minutesUserAlreadyAnalyzed + minutesAnalyzedFromVideo;
  if (newMinutesUserAlreadyAnalyzed >= minutesProvidedForPlan) {
    console.warn("User's analyze minutes for videos has met its plan limit.");
  }

  await updateDoc(doc(db, "users", userEmail), {
    minutesAnalyzedThisMonth: newMinutesUserAlreadyAnalyzed,
  });
  await updateDoc(doc(db, "users", userEmail), {
    lifetimeMinutesAnalyzed: increment(minutesAnalyzedFromVideo),
  });

  return clips;
}
