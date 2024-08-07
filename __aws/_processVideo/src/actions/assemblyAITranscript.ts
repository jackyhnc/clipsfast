import { AssemblyAI, TranscriptWord } from "assemblyai";

import dotenv from 'dotenv';
dotenv.config()

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});

export default async function assemblyAITranscript(videoURL: string) {
  try {
    type TTracker = {
      start: number;
      end: number | undefined;
    };
    const tracker: TTracker = {
      start: Date.now(),
      end: undefined,
    };

    const params = {
      audio: videoURL,
    };

    const transcript = await client.transcripts.transcribe(params);

    //const transcriptText = transcript.text
    const nestedTranscriptObjWithTimestamps = transcript.words;
    const transcriptObjWithTimestamps = nestedTranscriptObjWithTimestamps!.flat();
    if (transcriptObjWithTimestamps === undefined) {
      throw new Error("Retrieved empty transcript.");
    }

    let transcriptTextWithEmeddedTimeStamps = "@0";
    for (const wordObj of transcriptObjWithTimestamps as Array<TranscriptWord>) {
      let word = wordObj.text;

      if (transcriptObjWithTimestamps[transcriptObjWithTimestamps.length - 1] === wordObj) {
        word += `@${wordObj.end}`;
      } else if (/[.?!]$/.test(word)) {
        word += `@${wordObj.end}` + " ";
      } else {
        word += " ";
      }
      transcriptTextWithEmeddedTimeStamps += word;
    }

    tracker.end = Date.now();
    console.log(
      `assemblyAITranscript completed in ${((tracker.start - tracker.end) / 1000).toFixed(2)} seconds/`
    );
    return transcriptTextWithEmeddedTimeStamps;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to process transcript.");
  }
}
