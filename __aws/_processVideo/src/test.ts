import ytdl from "@distube/ytdl-core";

async function handler(youtubeVideoURL: string) {
  try {
    const youtubeVideoInfo = await ytdl.getBasicInfo(youtubeVideoURL);
    const itagsFormats = youtubeVideoInfo.formats.map((formatObj) => {
      return formatObj.itag;
    });
    console.log(itagsFormats)
    
    const chooseAudioFormat = () => {
      const idealAudioFormats = [141, 140]; //.m4a, 256k to 128k bitrate, left to right
    
      const chosenAudioFormat = idealAudioFormats.find((format) => itagsFormats.includes(format));
    
      if (chosenAudioFormat) {
        return chosenAudioFormat;
      }
      
      throw Error("No ideal audio formats in given Youtube video.");
    };
  
    const audioStream = ytdl(youtubeVideoURL, { quality: chooseAudioFormat() });
    await new Promise((resolve, reject) => {
      audioStream.on('data', (chunk) => {
        console.log(`Audio data chunk received: ${chunk.length} bytes`);
      });
      audioStream.on('end', () => {
        console.log('Audio download ended.');
        resolve("DONE");
      });
      audioStream.on('error', (error) => {
        reject(new Error("Unable to download YouTube audio. " + error.message));
      });
    });
  } catch (error:any) {
    throw new Error(error.message)
  }
}

await handler("https://www.youtube.com/watch?v=VPY6iIwOeUc")
