import { NextRequest, NextResponse } from "next/server";
import ytdl, { videoInfo } from "ytdl-core";
import fs from "fs";
import path from "path";
import { PassThrough } from 'stream';
import { uploadStreamToS3 } from "../autohighlights aws/actions/functions/uploadStreamToS3.mjs";

const sanitizeFilename = (filename: string) => {
  const invalidCharsRegex = /[^\w\s\-._(){}[\]~!,'@#$%+=]/g;

  const sanitizedFilename = filename.replace(invalidCharsRegex, "_");

  return sanitizedFilename.replace(/\s+/g, " ").trim();
}; //sanitize file before ffmpeg can open it bc invalid characters form yt vid title

export const POST = async (req: NextRequest) => {
  const youtubeVideoURL = "https://www.youtube.com/watch?v=TvrQnBDIDpI"

  const youtubeVideoInfo = await ytdl.getBasicInfo(youtubeVideoURL)

  const itagsFormats = youtubeVideoInfo.formats.map((formatObj) => {
    return formatObj.itag
  })
  const chooseVideoFormat = () => {    
    const idealVideoFormats = [ 137, 136, 135 ] //.mp4, 1080p to 480p, left to right
  
    for (const videoFormat of idealVideoFormats) {
      if (itagsFormats.includes(videoFormat)) {
        return videoFormat
      }
  
    }
    throw Error ("No ideal video formats in given Youtube video.")
  }
  const chooseAudioFormat = () => {
    const idealAudioFormats = [ 141, 140 ] //.m4a, 256k to 128k bitrate, left to right
  
    for (const audioFormat of idealAudioFormats) {
      if (itagsFormats.includes(audioFormat)) {
        return audioFormat
      }
  
    }
    throw Error ("No ideal video formats in given Youtube video.")
  }

  const youtubeVideoTitle = youtubeVideoInfo.videoDetails.title;
  const sanitizedYoutubeVideoTitle = sanitizeFilename(youtubeVideoTitle);

  const outputVideoName = sanitizedYoutubeVideoTitle?? "ytdl-No_Youtube_Title"

  const downloadVideo = async () => {
    const videoPassThroughStream = new PassThrough()
    const videoStream = ytdl(youtubeVideoURL, { quality: chooseVideoFormat() })
    videoStream.pipe(videoPassThroughStream)

    return await uploadStreamToS3(videoPassThroughStream, `ytdl/video/${outputVideoName}.mp4`)
  }
  const audioDownload = async () => {
    const audioPassThroughStream = new PassThrough()
    const videoStream = ytdl(youtubeVideoURL, { quality: chooseAudioFormat() })
    videoStream.pipe(audioPassThroughStream)

    return await uploadStreamToS3(audioPassThroughStream, `ytdl/audio/${outputVideoName}.m4a`)
  }
  
  try {
    const URLS = await Promise.all([downloadVideo(), audioDownload()])
    console.log("finished")
    return NextResponse.json(URLS)
  } catch (error) {
    console.error(error)
  }
};
