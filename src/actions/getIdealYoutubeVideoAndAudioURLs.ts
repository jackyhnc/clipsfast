"use server";

import ytdl from "@distube/ytdl-core";

export async function getIdealYoutubeVideoAndAudioURLs({
  url,
  idealVideoItags = [137, 136, 135], //mp4
  idealAudioItags = [141, 140], //m4a
  minimumVideoAndAudioItags = [22, 18], //mp4
}: {
  url: string;
  idealVideoItags?: number[];
  idealAudioItags?: number[];
  minimumVideoAndAudioItags?: number[];
}): Promise<{ video: string | undefined; audio: string | undefined; videoAndAudio: string | undefined }> {
  try {
    console.log("/////////////////////////@@@@@@@@@@@@")
    console.log(url)
    const youtubeInfo = await ytdl.getInfo(url);

    function getIdealVideoURL() {
      for (const idealVideoItag of idealVideoItags) {
        const idealVideoFormatObject = youtubeInfo.formats.find((format) => format.itag === idealVideoItag);

        if (idealVideoFormatObject) {
          return idealVideoFormatObject.url;
        } else {
          continue;
        }
      }
      return undefined
    }
    function getIdealAudioURL() {
      for (const idealAudioItag of idealAudioItags) {
        const idealAudioFormatObject = youtubeInfo.formats.find((format) => format.itag === idealAudioItag);

        if (idealAudioFormatObject) {
          return idealAudioFormatObject.url;
        } else {
          continue;
        }
      }
      return undefined
    }
    function getMinimumVideoAndAudioURL() {
      for (const minimumVideoAndAudioItag of minimumVideoAndAudioItags) {
        const minimumVideoAndAudioFormatObject = youtubeInfo.formats.find((format) => format.itag === minimumVideoAndAudioItag);

        if (minimumVideoAndAudioFormatObject) {
          return minimumVideoAndAudioFormatObject.url;
        } else {
          continue;
        }
      }
      return undefined
    }

    return {
      video: getIdealVideoURL(),
      audio: getIdealAudioURL(),
      videoAndAudio: getMinimumVideoAndAudioURL(),
    };
  } catch (error: any) {
    throw new Error(error.message + ": Failed to retrieve YouTube video's information.");
  }
}
