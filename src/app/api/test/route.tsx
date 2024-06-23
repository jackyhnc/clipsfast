import { NextRequest, NextResponse } from "next/server";
import ytdl, { videoInfo } from "ytdl-core";
import fs from "fs";
import path from "path";

const sanitizeFilename = (filename: string) => {
  const invalidCharsRegex = /[^\w\s\-._(){}[\]~!,'@#$%+=]/g;

  const sanitizedFilename = filename.replace(invalidCharsRegex, "_");

  return sanitizedFilename.replace(/\s+/g, " ").trim();
}; //sanitize file before ffmpeg can open it bc invalid characters form yt vid title

export const POST = async (req: NextRequest) => {
  const youtubeVideoURL = "https://www.youtube.com/watch?v=TvrQnBDIDpI"

  const youtubeVideoInfo = await ytdl.getBasicInfo(youtubeVideoURL);

  const itagsFormats = youtubeVideoInfo.formats.map((formatObj) => {
    return formatObj.itag
  })
  const chooseVideoFormat = () => {    
    const idealVideoFormats = [ 137, 136, 135, 134, 133 ]
  
    for (const format of idealVideoFormats) {
      if (itagsFormats.includes(format)) {
        console.log("foramt"+format)
        return format
      }
  
    }
    throw Error ("No valid video formats in given Youtube video")
  }
  const chooseAudioFormat = () => {
    const idealAudioFormats = [ 141, 140, 139 ]
  
    for (const format of idealAudioFormats) {
      if (itagsFormats.includes(format)) {
        console.log("foramt"+format)
        return format
      }
  
    }
    throw Error ("No valid video formats in given Youtube video")
  }

  const youtubeVideoTitle = youtubeVideoInfo.videoDetails.title;
  const sanitizedYoutubeVideoTitle = sanitizeFilename(youtubeVideoTitle);

  const outputVideoName = "ytdl-" + (sanitizedYoutubeVideoTitle?? "ytdl-No_Youtube_Title");
  const relativeOutputFilePath = "./public/ytdl/";

  const downloadVideo = async () => {
    const videoOutputVideoExtension = "mp4";
    const videoOutputVideoFileName = `${outputVideoName}.${videoOutputVideoExtension}`;
    const videoOutputFilePath = path.join(relativeOutputFilePath, "video", videoOutputVideoFileName);

    const format = chooseVideoFormat()
    const downloadStream = ytdl(youtubeVideoURL, { quality: format });
    const writeStream = fs.createWriteStream(videoOutputFilePath);

    let totalSize = 0;
    let downloadedSize = 0;

    downloadStream.on("response", (res) => {
        if (res.headers["content-length"]) {
            totalSize = parseInt(res.headers["content-length"], 10);
        } else {
            console.error("Video content length not provided in response headers.");
            downloadStream.destroy();
            writeStream.end();
            throw new Error("Video content length not provided.");
        }
    });

    downloadStream.on("data", (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
            const progress = (downloadedSize / totalSize) * 100;
            console.log(`Video download progress: ${progress.toFixed(2)}%`);
        }
    });

    const downloadComplete = new Promise<void>((resolve, reject) => {
        downloadStream.on("end", () => {
            console.log(`Video total size: ${totalSize} bytes`);
            console.log(`Video downloaded size: ${downloadedSize} bytes`);
            if (totalSize !== downloadedSize) {
                console.warn(`Video file size mismatch. Expected: ${totalSize} bytes, but got: ${downloadedSize} bytes`);
            }
            resolve();
        });

        downloadStream.on("error", (err) => {
            console.error("Error downloading the video:", err);
            reject(err);
        });

        writeStream.on("finish", resolve);
        writeStream.on("error", (err) => {
            console.error("Error writing to the video output file:", err);
            reject(err);
        });
    });

    downloadStream.pipe(writeStream);

    await downloadComplete;
  };
  const downloadAudio = async () => {
    const audioOutputVideoExtension = "m4a";
    const audioOutputVideoFileName = `${outputVideoName}.${audioOutputVideoExtension}`;
    const audioOutputFilePath = path.join(relativeOutputFilePath, "audio", audioOutputVideoFileName);

    const format = chooseAudioFormat()
    const downloadStream = ytdl(youtubeVideoURL, { quality: format });
    const writeStream = fs.createWriteStream(audioOutputFilePath);

    let totalSize = 0;
    let downloadedSize = 0;

    downloadStream.on("response", (res) => {
        if (res.headers["content-length"]) {
            totalSize = parseInt(res.headers["content-range"], 10);
            console.log(`Audio total size from content-length header: ${totalSize} bytes`);
        } else {
            console.error("Audio content length not provided in response headers.");
            downloadStream.destroy();
            writeStream.end();
            throw new Error("Audio content length not provided.");
        }
    });

    downloadStream.on("data", (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
            const progress = (downloadedSize / totalSize) * 100;
            console.log(`Audio download progress: ${progress.toFixed(2)}%`);
        }
    });

    const downloadComplete = new Promise<void>((resolve, reject) => {
        downloadStream.on("end", () => {
            console.log(`Audio total size: ${totalSize} bytes`);
            console.log(`Audio downloaded size: ${downloadedSize} bytes`);
            if (totalSize !== downloadedSize) {
                console.warn(`Audio file size mismatch. Expected: ${totalSize} bytes, but got: ${downloadedSize} bytes`);
            }
            resolve();
        });

        downloadStream.on("error", (err) => {
            console.error("Error downloading the audio:", err);
            reject(err);
        });

        writeStream.on("finish", resolve);
        writeStream.on("error", (err) => {
            console.error("Error writing to the audio output file:", err);
            reject(err);
        });
    });

    downloadStream.pipe(writeStream);

    await downloadComplete;
  };

  try {
    await Promise.all([downloadAudio(), downloadVideo()])

    return NextResponse.json(1);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to download YouTube video." });
  }
};
