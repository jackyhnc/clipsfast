import { TEvent } from "./types";


export const handler = async (event: TEvent) => {
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
  }
}