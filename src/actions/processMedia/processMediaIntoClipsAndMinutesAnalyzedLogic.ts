"use server";

import { TClip, TMedia } from "@/app/studio/types";
import { db } from "@/config/firebase";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { getUserPlanMinutes } from "@/utils/getUserPlanMinutes";
import { sanitizeMediaURL } from "@/utils/sanitizeMediaURL";
import { getYoutubeInfo } from "../getYoutubeInfo";
import Ffmpeg from "fluent-ffmpeg";

async function getVideoDuration(props: { mediaURL: string, videoType: TMedia["type"] }){
  const { mediaURL, videoType } = props;

  let durationInSeconds: number = 0

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

function calculatePercentToBeAnalyzed(props: {durationInSeconds: number, percentAlreadyAnalyzed: number}) {
  const { percentAlreadyAnalyzed, durationInSeconds } = props;

  const durationInMinutes = durationInSeconds / 60

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
    minutesToAnalyze
  } 
}

export async function processMediaIntoClipsAndUserMinutesAnalyzedLogic(
  { mediaURL, userEmail, reanalyze = false }: {
    mediaURL: string;
    userEmail: string;
    reanalyze?: boolean;
  }
) {
  //make more secure bc i dont want someone on client to trigger this server function with not their
  //userEmail somehow and using someone else's account's minutes analyzed credits

  const userDocRef = doc(db, "users", userEmail);
  const userDoc = (await getDoc(userDocRef)).data();
  const userPlan = userDoc?.userPlan;
  const minutesUserAlreadyAnalyzed = userDoc?.minutesAnalyzed;
  
  const mediaDocRef = doc(db, "media", sanitizeMediaURL(mediaURL));
  let mediaDoc = (await getDoc(mediaDocRef)).data() as TMedia

  // check if user has enough minutes to analyze video
  const minutesProvidedForPlan = getUserPlanMinutes(userPlan);

  if (minutesUserAlreadyAnalyzed >= minutesProvidedForPlan) {
    throw new Error("User already analyzed to the limit their plan allows for this month.");
  }

  // check if video should be reanalyzed
  const mediaPercentageAnalyzed: number = mediaDoc?.percentAnalyzed

  if (reanalyze) {
    mediaDoc.percentAnalyzed = 0
    await updateDoc(mediaDocRef, mediaDoc)
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
  mediaDoc.percentAnalyzed = percentToBeAnalyzed
  await updateDoc(mediaDocRef, mediaDoc)

  // process video into clips
  const awsResponse = await fetch("https://mkpogdgywg.execute-api.us-east-1.amazonaws.com/prod", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_url: mediaURL,
      edit_config: {
        clips_length_range_seconds: [],
        clips_content_prompt: "",
        clips_title_prompt: "",
      },
      minutes_to_analyze: minutesToAnalyze,
    }),
    // properties named with undercase bc lambda function is python
  });
  ////////////front end works with the clips page i thnk fix lambda's input output and itll be gucci /////
  const clips: Array<TClip> = await awsResponse.json();
  console.log(clips, "clips");

  // update user minutes analyzed this month & lifetime minutes analyzed
  const minutesAnalyzedFromVideo = minutesToAnalyze;

  let newMinutesUserAlreadyAnalyzed = minutesUserAlreadyAnalyzed + minutesAnalyzedFromVideo;
  if (newMinutesUserAlreadyAnalyzed >= minutesProvidedForPlan) {
    console.warn("User's analyze minutes for videos has met its plan limit.");
  }

  await updateDoc(doc(db, "users", userEmail), {
    minutesAnalyzed: newMinutesUserAlreadyAnalyzed,
  });
  await updateDoc(doc(db, "users", userEmail), {
    lifetimeMinutesAnalyzed: increment(minutesAnalyzedFromVideo),
  });

  console.log("%c clips processed", "color: blue");
  return clips;
}
