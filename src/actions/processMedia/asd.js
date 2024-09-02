const Ffmpeg = require("fluent-ffmpeg");

async function getHostedVideoDuration(videoUrl) {
  try {
    const { format } = await new Promise((resolve, reject) =>
      Ffmpeg.ffprobe(videoUrl, (err, metadata) =>
        err ? reject(err) : resolve(metadata)
      )
    );
    return format.duration;
  } catch (error) {
    error.message = `Error retrieving video duration: ${error.message}`;
    console.error(error);
    throw error;
  }
}

console.log(getHostedVideoDuration('https://jackkhc.github.io/hostingThings/clipsfast/Rarest%20Pineapple%20World.mp4'))