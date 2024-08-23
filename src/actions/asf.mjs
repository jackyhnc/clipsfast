import Ffmpeg from "fluent-ffmpeg";
import { getYoutubeInfo } from "./getYoutubeInfo";

async function getVideoDuration(props){
  const { mediaURL, videoType } = props;

  let durationInSeconds = 0

  if (videoType === "youtube") {
      const youtubeInfo = await getYoutubeInfo(mediaURL);
      durationInSeconds = Number(youtubeInfo.durationInSeconds);

  } else if (videoType === "hosted") {
      durationInSeconds = await getHostedVideoDuration(mediaURL);
  }

  return durationInSeconds;

  async function getHostedVideoDuration(videoUrl) {
    try {
        const duration = await new Promise((resolve, reject) => {
            Ffmpeg.ffprobe(videoUrl, (err, metadata) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(metadata.format.duration);
                }
            });
        });
        return duration;
    } catch (error) {
        error.message = 'Error retrieving video duration: ' + error.message;
        console.error(error)
        throw error;
    }
}
}
console.log(getVideoDuration({ mediaURL: "https://www.youtube.com/watch?v=5nXQW9nKQxM", videoType: "youtube" }))
