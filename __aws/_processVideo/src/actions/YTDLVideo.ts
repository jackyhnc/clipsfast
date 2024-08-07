import ytdl from "@distube/ytdl-core";
import { PassThrough } from "stream";
import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";

import uploadStreamToS3 from "./miniFunctions/uploadStreamToS3";

export default async function YTDLVideo(url: string) {
  try {
    type TTracker = {
      start: number;
      end: number | undefined;
    };
    const tracker: TTracker = {
      start: Date.now(),
      end: undefined,
    };

    const youtubeVideoURL = url;

    const youtubeVideoInfo = await ytdl.getBasicInfo(youtubeVideoURL);
    const itagsFormats = youtubeVideoInfo.formats.map((formatObj) => {
      return formatObj.itag;
    });
    const chooseVideoFormat = () => {
      const idealVideoFormats = [137, 136, 135]; // .mp4, 1080p to 480p, left to right

      const chosenVideoFormat = idealVideoFormats.find((format) => itagsFormats.includes(format));

      if (chosenVideoFormat) {
        return chosenVideoFormat;
      }

      throw new Error("No ideal video formats in given YouTube video.");
    };
    const chooseAudioFormat = () => {
      const idealAudioFormats = [141, 140]; //.m4a, 256k to 128k bitrate, left to right

      const chosenAudioFormat = idealAudioFormats.find((format) => itagsFormats.includes(format));

      if (chosenAudioFormat) {
        return chosenAudioFormat;
      }

      throw Error("No ideal audio formats in given Youtube video.");
    };

    const youtubeVideoTitle = youtubeVideoInfo.videoDetails.title;
    if (!youtubeVideoTitle) {
      throw Error("Unable to get YouTube video title.");
    }
    const outputVideoName = youtubeVideoTitle ?? "ytdl-No_Youtube_Title_" + uuidv4();

    const videoStream = ytdl(youtubeVideoURL, { quality: chooseVideoFormat() });
    videoStream.on("data", (chunk) => {
      console.log(`Video data chunk received: ${chunk.length} bytes`);
    });
    videoStream.on("end", () => {
      console.log("Video download ended.");
    });
    videoStream.on("error", () => {
      throw Error("Unable to download YouTube video.");
    });

    const audioStream = ytdl(youtubeVideoURL, { quality: chooseAudioFormat() });
    audioStream.on("data", (chunk) => {
      console.log(`Audio data chunk received: ${chunk.length} bytes`);
    });
    audioStream.on("end", () => {
      console.log("Audio download ended.");
    });
    audioStream.on("error", (error) => {
      throw Error("Unable to download YouTube audio: " + error);
    });

    const ffmpegProcess = spawn(
      "Ffmpeg",
      [
        //disable unnecessary logs
        "-loglevel",
        "0",
        "-hide_banner",
        //input
        "-i",
        "pipe:3",
        "-i",
        "pipe:4",
        "-map",
        "0:a",
        "-map",
        "1:v",
        //encoding
        "-c:a",
        "aac",
        "-preset",
        "veryfast",
        "-crf",
        "28",
        "-maxrate",
        "2M",
        "-bufsize",
        "4M",
        //output
        "-f",
        "mp4",
        "-movflags",
        "frag_keyframe+empty_moov+default_base_moof", // Enable streaming
        "-frag_duration",
        "5000000",
        "pipe:5",
      ],
      {
        windowsHide: true,
        stdio: ["inherit", "inherit", "inherit", "pipe", "pipe", "pipe"],
      }
    );
    ffmpegProcess.on("data", (data) => {
      console.error("Ffmpeg stderr:", data.toString());
    });
    const ffmpegProcessPromise = new Promise<void>((resolve) => {
      ffmpegProcess.on("close", (code) => {
        tracker.end = Date.now();
        console.log(
          `Ffmpeg process exited with code ${code} in ${((tracker.end - tracker.start) / 1000).toFixed(
            2
          )} seconds.`
        );
        resolve();
      });
    });
    ffmpegProcess.on("error", (err: any) => {
      console.error("Ffmpeg process error:", err);
      throw new Error(err);
    });

    audioStream.pipe(ffmpegProcess.stdio[3] as any);
    videoStream.pipe(ffmpegProcess.stdio[4] as any);

    const mergeVideoAndAudioStream = new PassThrough();

    (ffmpegProcess.stdio as any)[5].pipe(mergeVideoAndAudioStream);

    const videoKeyFilePath = `ytdl/${outputVideoName}.mp4`;
    const [outputVideoURL] = await Promise.all([
      uploadStreamToS3(mergeVideoAndAudioStream, videoKeyFilePath),
      ffmpegProcessPromise,
    ]);
    if (!outputVideoURL.length) {
      console.log(outputVideoURL);
      throw Error("Unable to retrieve a signed audio URL.");
    }

    return {
      url: outputVideoURL,
      path: videoKeyFilePath,
      videoName: outputVideoName,
    };
  } catch (error: any) {
    console.error(error);
    throw new Error("Unable to download YouTube video:" + error.message);
  }
}
