"use server";

import { TClip, TClipProcessed, TUser } from "@/app/studio/types";
import { db } from "@/config/firebase";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import Ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

import { spawn } from "child_process";
import { AssemblyAI } from "assemblyai";
import { v4 } from "uuid";
import { getIdealYoutubeVideoAndAudioOnClient } from "@/utils/getIdealYoutubeVideoAndAudioOnClient";
import { uploadStreamToS3 } from "../uploadStreamToS3";
import { createWriteStream } from "fs";

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

  // process subtitles

  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || "",
  });

  const transcriptObj = await client.transcripts.get(clip.transcriptID);
  if (!transcriptObj) {
    throw new Error("Transcript ID didn't work for video.");
  }
  if (!transcriptObj.words) {
    throw new Error("No words object for this transcript.");
  }
  const trimmedTranscriptObj = transcriptObj.words.filter(
    ({ start, end }) => start / 1000 >= clip.time.start && end / 1000 <= clip.time.end
  );

  type TSubtitlesObj = {
    text: string;
    start: number;
    end: number;
  };
  const subtitlesObj: TSubtitlesObj[] = [];

  let currentSubtitlesObj: { text: string | undefined; start: number | undefined; end: number | undefined } =
    {
      text: undefined,
      start: undefined,
      end: undefined,
    };
  const maxWordsAtOnce = 5;
  const maxCharactersAtOnce = 24;
  const minimumSecondsBetweenWords = 1;

  for (const wordObj of trimmedTranscriptObj) {
    const word = wordObj.text;
    const start = Number((wordObj.start / 1000 - clip.time.start).toFixed(3));
    const end = Number((wordObj.end / 1000 - clip.time.start).toFixed(3));

    if (!currentSubtitlesObj.text) {
      currentSubtitlesObj.text = word;
      currentSubtitlesObj.start = start;

      if (/[.!?,]/.test(currentSubtitlesObj.text.slice(-1))) {
        currentSubtitlesObj.end = end;
        // @ts-ignore
        subtitlesObj.push(currentSubtitlesObj);

        currentSubtitlesObj = {
          text: undefined,
          start: undefined,
          end: undefined,
        };
      }

      continue;
    }

    const currentWordObjindex = trimmedTranscriptObj.indexOf(wordObj);
    const nextWordObj = trimmedTranscriptObj[currentWordObjindex + 1];
    // for last item of trimmedTranscriptObj
    if (nextWordObj === undefined) {
      currentSubtitlesObj.end = end;
      // @ts-ignore
      subtitlesObj.push(currentSubtitlesObj);
      break;
    }

    const secondsBetweenCurrentAndNextWord =
      Number((nextWordObj.start / 1000 - clip.time.start).toFixed(3)) - end;
    const subtitlesObjTextIfNextWordAdded = currentSubtitlesObj.text + " " + nextWordObj.text;
    const amountOfCharactersInSubtitlesObjIfNextWordAdded = subtitlesObjTextIfNextWordAdded.length;

    if (
      amountOfCharactersInSubtitlesObjIfNextWordAdded >= maxCharactersAtOnce &&
      !currentSubtitlesObj.text.includes("\n")
    ) {
      currentSubtitlesObj.text += `\n${word}`;
    } else {
      currentSubtitlesObj.text += ` ${word}`;
    }

    if (
      currentSubtitlesObj.text.split(/ |\n/).length >= maxWordsAtOnce ||
      /[.!?,]/.test(currentSubtitlesObj.text.slice(-1)) ||
      secondsBetweenCurrentAndNextWord >= minimumSecondsBetweenWords
    ) {
      currentSubtitlesObj.end = end;
      // @ts-ignore
      subtitlesObj.push(currentSubtitlesObj);

      currentSubtitlesObj = {
        text: undefined,
        start: undefined,
        end: undefined,
      };
    }
  }

  const subtitles = subtitlesObj
    .map(({ text, start, end }) => {
      text = text.replace(/'/g, "").replace(/"/g, "");

      return `drawtext=text='${text}':fontfile='src/actions/processMedia/misc/roboto-bold.ttf':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=70:fontcolor=white:borderw=8:bordercolor=black:enable='between(t,${start},${end})':text_align=C`;
    })
    .join(",");

  // process brainrot clip

  const brainrotClipCategory = Object.keys(
    clipEditConfig.brainrotClip
  )[0] as keyof TClipEditConfig["brainrotClip"];

  const brainrotClipURL = `https://clipsfast.s3.amazonaws.com/public/${brainrotClipCategory}-${clipEditConfig.brainrotClip[brainrotClipCategory]}.mp4`;

  // process final video

  const processingOptions = [
    "-ss",
    clip.time.start,
    "-i",
    directURLs.videoAndAudio, // 0: blur

    "-ss",
    clip.time.start,
    "-i",
    directURLs.video, // 1: main

    "-i",
    brainrotClipURL, // 2: brainrot clip
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

    [output-nosubtitles]${subtitles.length ? subtitles : "null"}
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
    "-c:a",
    "copy",
    "-y", // Overwrite output file if it already exists
  ];

  const ffmpegProcessClip = spawn("ffmpeg", [
    '-loglevel', 'verbose',
    ...processingOptions,
    ...videoEditingOptions,
    ...encodingOptions,
    "output.mp4",
  ]);

  /////video freezes at start for lil and its also longer than supposed
  //////its just streaming it that fucks it up i think, saving it works, i tested

  const startTime = Date.now();
  ffmpegProcessClip.stdout.on("data", (data) => {
    console.log(`FFmpeg stdout: ${data}`);
  });
  ffmpegProcessClip.stderr.on("data", (data) => {
    console.log(`FFmpeg stderr: ${data}`);
  });
  ffmpegProcessClip.on("error", (err) => {
    console.error("FFmpeg error:", err);
    throw new Error(err.message)
  });
  ffmpegProcessClip.on("close", (code: number) => {
    const endTime = Date.now();
    if (code === 0) {
      console.log(`Video processing finished successfully in ${(endTime - startTime) / 1000}s`);
    } else {
      console.error(`FFmpeg process exited with code ${code}`);
    }
  });

  const videoOutputStream = new PassThrough();
  ffmpegProcessClip.stdout.pipe(videoOutputStream).on("error", (err) => {
    console.error("Output stream error:", err);
  });

  videoOutputStream.pipe(createWriteStream("output.mp4"));

  return

  // process thumbnail

  const screenshotTimestamp = Number((Math.random() * (clip.time.end - clip.time.start)).toFixed(3))
  const screenshotOptions = [
    "-ss",
    `${screenshotTimestamp}`, // Timestamp at which to capture the screenshot
    "-vframes",
    "1", // Capture only one frame
    "-q:v",
    "2", // Quality of the screenshot (lower values result in higher quality)
  ];
  
  const ffmpegProcessThumbnail = spawn("ffmpeg", [
    ...screenshotOptions,
    "-i",
    "pipe:0",
    "output.png"
  ])
  
  videoOutputStream.pipe(ffmpegProcessThumbnail.stdin);
  
  ffmpegProcessThumbnail.stderr.on("data", (data) => {
    console.log(`FFmpeg stderr: ${data}`);
  });
  ffmpegProcessThumbnail.on("error", (err) => {
    console.error("FFmpeg error:", err);
    throw new Error(err.message)
  });
  ffmpegProcessThumbnail.on("close", (code: number) => {
    if (code === 0) {
      console.log(`Thumbnail generation finished successfully`);
    } else {
      console.error(`FFmpeg process exited with code ${code}`);
    }
  });

  return

  const processedClipGeneratedURL = await uploadStreamToS3(videoOutputStream, `clips/${clip.id}.mp4`);

  const processedClipThumbnailURL = await uploadStreamToS3(videoOutputStream, `thumbnails/${clip.id}.jpg`);

  const processedClip: TClipProcessed = {
    ...clip,
    generatedURL: processedClipGeneratedURL,
    thumbnail: processedClipThumbnailURL,
  };
  
  return {
    processedClip,
  };
}

export async function processExportClip({
  clip,
  userEmail,
  directURLs,
  clipEditConfig
}: {
  clip: TClip;
  userEmail: string;
  directURLs: ReturnType<typeof getIdealYoutubeVideoAndAudioOnClient> extends Promise<infer U> ? U : never;
  clipEditConfig: TClipEditConfig;
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
    directURLs,
  });

  await updateDoc(userDocRef, {
    clipsInProgress: arrayRemove(clip),
    clipsProcessed: arrayUnion(processedClip),
  });

  return;
}
