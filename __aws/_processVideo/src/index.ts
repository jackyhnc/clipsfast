import { v4 as uuid } from "uuid";

import YTDLVideo from "./actions/YTDLVideo";
import assemblyAITranscript from "./actions/assemblyAITranscript";
import chatgptAutoHighlights from "./actions/chatgptAutoHighlights";



export const handler = async (event: any) => {
  try {
    let { videoURL, clipsConfig } = event;
    const { clipsLengthRangeInSeconds, clipsPreferredContentPrompt, clipsPreferredTitlePrompt } = clipsConfig;
    const videoNameRegex = /^https:\/\/.+?\/([^\/]+)\.[^\/]+$/;
    let videoName: string = decodeURIComponent(videoURL).match(videoNameRegex)?.[1] ?? "video_name_" + uuid();
    const videoExtensionRegex = /\.(?<extension>[^.\/?#]+)(?:\?|$)/;
    const videoExtension = videoURL.match(videoExtensionRegex)?.groups?.extension ?? "mp4";

    const isYoutubeLinkRegex =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|user\/\S*#\S*\/\S*\/\S*\/|shorts\/)?|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
    if (isYoutubeLinkRegex.test(videoURL)) {
      const youtubeVideoURL = videoURL;

      const YTDL = await YTDLVideo(youtubeVideoURL);

      videoURL = YTDL.url; //videoURL is now the downloaded s3 YT video link, bc normal YT links can't get transcripted later
      videoName = YTDL.videoName as string;
    }

    const transcriptTextWithEmeddedTimeStamps = await assemblyAITranscript(videoURL);
    const highlightsTimestampsObjProps = {
      transcriptTextWithEmeddedTimeStamps,
      clipsLengthRangeInSeconds,
      clipsPreferredContentPrompt,
      clipsPreferredTitlePrompt,
    };
    const highlightsTimestampsObj = await chatgptAutoHighlights(highlightsTimestampsObjProps);

    return highlightsTimestampsObj;

    /*

    const outputFilePaths = [];

    const inputVideoFileNameToEdit = `${videoName}.${videoExtension}`;
    const relativeInputFilePathRouteToEdit = "./public/extracted_video/";
    const relativeInputFilePathToEdit = path.join(
      relativeInputFilePathRouteToEdit,
      inputVideoFileNameToEdit
    );

    for (const highlightedTimestamp of highlightedTimestamps) {
      const { start, end, title } = highlightedTimestamp;

      const startTimeInSeconds = start / 1000;
      const endTimeInSeconds = end / 1000;

            const indexOfhighlightedTimestamp = highlightedTimestamps.findIndex((time:any) => {
                return time.start === start && time.end === end
            })

      const outputVideoFileName = `${title}.${videoExtension}`;
      const relativeOutputFilePathRoute = "./public/edited_video/";
      const relativeOutputFilePath = path.join(
        relativeOutputFilePathRoute,
        outputVideoFileName
      );

      await new Promise((resolve, reject) => {
        Ffmpeg(relativeInputFilePathToEdit)
          .output(relativeOutputFilePath)
          .setStartTime(startTimeInSeconds)
          .duration(endTimeInSeconds - startTimeInSeconds)
          .size("1080x1920")
          .videoCodec("libx264")
          .audioCodec("libmp3lame")
          .autopad()
          .on("error", (error) => {
            console.error(`Error editing video: ${outputVideoFileName}`, error);
            reject(error);
          })
          .on("progress", (progress) => {
            console.log(
              `Progress editing video: ${outputVideoFileName}: ${Math.floor(
                progress.percent
              )}%`
            );
          })
          .on("end", () => {
            console.log(`Finished editing video: ${outputVideoFileName}`);
            resolve();
          })
          .run();
      });
      const outputFilePath = relativeOutputFilePath.replace("public", "");
      //so when videoplayer uses these output links, it can use the root path without public in it

      outputFilePaths.push(outputFilePath);
    }

    const videoURLOutputPathsObject = {
      mediaURL: videoURL,
      editedClipsPaths: outputFilePaths,
    };

    return videoURLOutputPathsObject;
    */
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};

//////////////call function to test
const handlerParams = {
  videoURL: "https://www.youtube.com/watch?v=xdeFB7I0YH4",
  clipsConfig: {
    videoLengthRangeInSeconds: [0, 1000],
    userPromptContent: "educate and entertain viewers",
    userPromptTitle: "make it crazy and add the eggplant emoji",
  }
};
handler(handlerParams);
