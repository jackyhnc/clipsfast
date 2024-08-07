import ytdl from "@distube/ytdl-core";
import { v4 as uuidv4 } from "uuid";

import uploadStreamToS3 from "./miniFunctions/uploadStreamToS3";

export default async function YTDLAudioOnly(youtubeVideoURL: string) {
  try {
    type TTracker = {
      start: number;
      end: number | undefined;
    };
    const tracker: TTracker = {
      start: Date.now(),
      end: undefined,
    };

    const youtubeVideoInfo = await ytdl.getBasicInfo(youtubeVideoURL);
    const itagsFormats = youtubeVideoInfo.formats.map((formatObj) => {
      return formatObj.itag;
    });
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

    const audioStream = ytdl(youtubeVideoURL, { quality: chooseAudioFormat() });
    audioStream.on("data", (chunk) => {
      console.log(`Audio data chunk received: ${chunk.length} bytes`);
    });
    audioStream.on("end", () => {
      console.log("Audio download ended.");
      console.log(`Audio streamed ended in ${((Date.now() - tracker.start) / 1000).toFixed(2)} seconds.`);
    });
    audioStream.on("error", () => {
      throw Error("Unable to download YouTube audio.");
    });

    const audioKeyFilePath = `ytdl/audio/${outputVideoName}.m4a`;
    const signedAudioURL = await uploadStreamToS3(audioStream, audioKeyFilePath);
    if (!signedAudioURL.length) {
      console.log(signedAudioURL);
      throw Error("Unable to retrieve a signed audio URL.");
    }

    tracker.end = Date.now();
    console.log(`YTDLAudioOnly completed in ${((tracker.end - tracker.start) / 1000).toFixed(2)} seconds.`);

    return {
      url: signedAudioURL,
      path: audioKeyFilePath,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Unable to download YouTube audio.");
  }
}
