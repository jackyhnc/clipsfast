"use server";

import ytdl, { videoFormat } from "@distube/ytdl-core";

export async function getIdealYoutubeVideoAndAudioFormats({
  url,
  idealVideoItags = [137, 136, 135], //mp4
  idealAudioItags = [141, 140], //m4a
  minimumVideoAndAudioItags = [22, 18], //mp4
}: {
  url: string;
  idealVideoItags?: number[];
  idealAudioItags?: number[];
  minimumVideoAndAudioItags?: number[];
}): Promise<{ video: videoFormat; audio: videoFormat; videoAndAudio: videoFormat }> {
  try {
    const formats = (await ytdl.getInfo(url)).formats
    const itags = formats.map(format => format.itag)
    
    function getIdealVideoURL() {
      for (const idealVideoItag of idealVideoItags) {
        if (itags.includes(idealVideoItag)) {
          return formats.find(format => format.itag === idealVideoItag)
        }
      }
      throw new Error("No ideal video URL found.")
    }
    function getIdealAudioURL() {
      for (const idealAudioItag of idealAudioItags) {
        if (itags.includes(idealAudioItag)) {
          return formats.find(format => format.itag === idealAudioItag)
        }
      }
      throw new Error("No ideal audio URL found.")
    }
    function getMinimumVideoAndAudioURL() {
      for (const minimumVideoAndAudioItag of minimumVideoAndAudioItags) {
        if (itags.includes(minimumVideoAndAudioItag)) {
          return formats.find(format => format.itag === minimumVideoAndAudioItag)
        }
      }
      throw new Error("No minimum video and audio URL found.")
    }

    return {
      video: getIdealVideoURL() as videoFormat,
      audio: getIdealAudioURL() as videoFormat,
      videoAndAudio: getMinimumVideoAndAudioURL() as videoFormat,
    };
  } catch (error: any) {
    throw new Error(error.message + ": Failed to retrieve YouTube video's information.");
  }
}
