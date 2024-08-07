import OpenAI from "openai/index.mjs";
import { TClip } from "../../types";

import dotenv from 'dotenv';
dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function chatgptAutoHighlights({
  transcriptTextWithEmeddedTimeStamps = "",
  clipsLengthRangeInSeconds = [20, 60],
  clipsPreferredContentPrompt = "educate and entertain viewers",
  clipsPreferredTitlePrompt = "hook viewers and include emojis",
}) {
  try {
    const clipsLengthRangeInMiliseconds = clipsLengthRangeInSeconds.map(
      (value) => value * 1000
    );
    const [clipsMinLengthInMiliseconds, clipsMaxLengthInMiliseconds] =
      clipsLengthRangeInMiliseconds;

    if (!transcriptTextWithEmeddedTimeStamps) {
      throw new Error("Stopped AI from interpreting null or empty transcript.");
    }
    const prompt = `
        I will provide a transcript where each sentence is followed by a '@' and a timestamp representing its position in the video. 
        
        Please identify the best segments from this transcript, in timestamps, that will 
        ${clipsPreferredContentPrompt}. 
        
        Each segment must be from ${clipsMinLengthInMiliseconds} milliseconds to a max of 
        ${clipsMaxLengthInMiliseconds} milliseconds long to provide substantial content. 
        
        Provide a title that will ${clipsPreferredTitlePrompt}.
    
        Transcript:
        ${transcriptTextWithEmeddedTimeStamps}`;

    console.log(prompt);

    const chatgptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "user",
          content: prompt,
        },
        {
          role: "system",
          content: `You output no conversation, only the formatted timestamps in a list format in a single line of 
                    JSON: [ {start: startTimestamp, end: endTimestamp, title: titleOfSegment } ]. `,
        },
      ],
      temperature: 1,
      max_tokens: 4095,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });


    try {
      const highlightedTimestamps = JSON.parse(
        chatgptResponse.choices[0]?.message?.content as string
      );

      const clipsArray: Array<TClip> = highlightedTimestamps.map((res: any) => {
        const clip: TClip = {
          title: res.title,
        
          time: {
            start: res.start,
            end: res.end,
          },
        
          url: ""
        }
        return clip
      }) 

      return clipsArray
    } catch (error: any) {
      console.log({
        "Chatgpt message": chatgptResponse.choices[0].message.content,
      });
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message)
  }
}
