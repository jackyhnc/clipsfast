"use server";

import { TClip, TClipProcessed, TUser } from "@/app/studio/types";
import { db } from "@/config/firebase";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import Ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

import { spawn } from "child_process";
import { AssemblyAI } from "assemblyai";

type TClipEditConfig = {
  brainrotClip:
    | { "fortnite-clip": 1 | 2 | 3 | 4 }
    | { "subway-surfers": 1 | 2 | 3 | 4 }
    | { "minecraft-parkour": 1 | 2 | 3 | 4 }
    | { "minecraft-bridge": 1 | 2 | 3 };
};

export async function processClip({
  clip,
  clipEditConfig,
  directURLs,
}: {
  clip: TClip;
  clipEditConfig: TClipEditConfig;
  directURLs: any;
}) {
  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || "",
  });
  
  const transcriptObj = await client.transcripts.get(clip.transcriptID)
  if (!transcriptObj) {
    throw new Error("Transcript ID didn't work for video.");
  }
  if (!transcriptObj.words) {
    throw new Error("No words object for this transcript.");
  }

  type TSubtitlesObj = {
    text: string | undefined,
    start: number | undefined,
    end: number | undefined,
  }
  const subtitlesObj: TSubtitlesObj[] = []

  const currentSubtitlesObj: TSubtitlesObj = {
    text: undefined,
    start: undefined,
    end: undefined,
  }
  let maxWordsAtOnce = undefined


  /////// make it so if the next word is far away like 1 second. it cuts. but ALSO, keep the max words at once under 1-3.
  for (const wordObj of transcriptObj.words) {
    const word = wordObj.text
    const start = wordObj.start
    const end = wordObj.end
    
    if (!currentSubtitlesObj.text && !maxWordsAtOnce) {
      currentSubtitlesObj.text = word
      currentSubtitlesObj.start = start

      const absoluteMaxWordsAtOnce = 3
      maxWordsAtOnce = Math.ceil(Math.random() * absoluteMaxWordsAtOnce)

      continue
    }

    const amountOfWordsInCurrentSubtitlesObj = (currentSubtitlesObj.text!.split(" ")).length
    if (amountOfWordsInCurrentSubtitlesObj < maxWordsAtOnce!) {
      currentSubtitlesObj.text += ` ${word}`
    } else {
      currentSubtitlesObj.text += ` ${word}`
      currentSubtitlesObj.end = end
      console.log(currentSubtitlesObj)
      subtitlesObj.push(currentSubtitlesObj)
      
      currentSubtitlesObj.text = undefined
      currentSubtitlesObj.start = undefined
      currentSubtitlesObj.end = undefined

      maxWordsAtOnce = undefined
    }
  }
  return


  const brainrotClipCategory = Object.keys(
    clipEditConfig.brainrotClip
  )[0] as keyof TClipEditConfig["brainrotClip"];

  const brainrotClipURL = `https://clipsfast.s3.amazonaws.com/public/${brainrotClipCategory}-${clipEditConfig.brainrotClip[brainrotClipCategory]}.mp4`;

  console.log(directURLs);

  const processingOptions = [
    "-ss",
    clip.time.start,
    "-i",
    directURLs.videoAndAudio, // 1: blur

    "-ss",
    clip.time.start,
    "-i",
    directURLs.video, // 2: main

    "-i",
    brainrotClipURL, // 3: brainrot clip
  ];

  const videoEditingOptions = [
    "-filter_complex",
    `
    [0:v]scale=h=1920:w=-1,crop=w=1080:h=1920:x=(iw-ow)/2:y=0,boxblur=30[bg-blur-overlay];
    [bg-blur-overlay]drawbox=x=0:y=0:w=iw:h=ih:color=black@0.5:t=fill[darken-bg-blur-video];

    [1:v]scale=w=1080:h=-1[main-video];

    [2:v]scale=w=1080:h=-1[brainrot-video];

    [darken-bg-blur-video][main-video]overlay=(W-w)/2:(H/2)-h[main-video-darken-bg-blur-video];
    [main-video-darken-bg-blur-video][brainrot-video]overlay=(W-w)/2:(H)/2[output-nosubtitles];


    [output-nosubtitles]

    `,
    "-t",
    `${clip.time.end - clip.time.start}`,
  ];

  const encodingOptions = [
    "-c:v",
    "libx264",
    "-preset",
    "superfast",
    "-crf",
    "23",
    "-threads",
    "1", // TO TEST VERCEL
    "-y", // Overwrite output file if it already exists
  ];

  const ffmpegProcess = spawn("ffmpeg", [
    "-loglevel",
    "verbose",
    ...processingOptions,
    ...videoEditingOptions,
    ...encodingOptions,
    `src/actions/processMedia/videos/asdf.mp4`, // Output file path
  ]);
  const startTime = Date.now();
  ffmpegProcess.stdout.on("data", (data) => {
    console.log(`FFmpeg stdout: ${data}`);
  });

  ffmpegProcess.stderr.on("data", (data) => {
    console.log(`FFmpeg stderr: ${data}`);
  });
  ffmpegProcess.on("error", (err) => {
    console.error("FFmpeg error:", err);
  });
  ffmpegProcess.on("close", (code: number) => {
    const endTime = Date.now();
    if (code === 0) {
      console.log(`Processing finished successfully in ${(endTime - startTime) / 1000}s`);
    } else {
      console.error(`FFmpeg process exited with code ${code}`);
    }
  });

  const inputStream = new PassThrough();
  /*
  const downloadProcess = spawn('curl', ['-L', clip.mediaURL]);
  downloadProcess.stdout.pipe(inputStream)
    .on('error', (err) => {
      console.error('Download error:', err);
    })
    .on('end', () => {
      console.log('Downloaded video');
    })
  inputStream.pipe(ffmpegProcess.stdin);
  */

  /*
  const outputStream = new PassThrough();
  ffmpegProcess.stdout.pipe(outputStream);
  outputStream.pipe(fs.createWriteStream("src/actions/processMedia/videos/test.mp4"))
    .on('error', (err) => {
      console.error('Output stream error:', err);
    });
  */

  const processedClip: TClipProcessed = {
    ...clip,
    generatedURL: "s3.aspdfonasdf",
    thumbnail: "asdfasdfasdfasdfasdf /////////",
  };
  return {
    processedClip,
  };
}

export async function processExportClip({
  clip,
  userEmail,
  directURL,
}: {
  clip: TClip;
  userEmail: string;
  directURL: string;
}) {
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

  const processedClip = await processClip({
    clip,
    clipEditConfig: {
      brainrotClip: { "fortnite-clip": 1 },
    },
    directURLs: "asdfasdf REPLACE",
  });

  await updateDoc(userDocRef, {
    clipsInProgress: arrayRemove(clip),
    clipsProcessed: arrayUnion(processedClip),
  });

  return;
}
