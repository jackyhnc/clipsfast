"use server"

import ytdl from "@distube/ytdl-core";

import { AssemblyAI } from "assemblyai";
import Anthropic from "@anthropic-ai/sdk";
import { TClip } from "@/app/studio/types";
import { TextBlock } from "@anthropic-ai/sdk/resources/messages.mjs";
import { getYoutubeInfo } from "@/actions/getYoutubeInfo";
import { getVideoTypeClassification } from "@/utils/getVideoTypeClassification";

if (!process.env.ASSEMBLYAI_API_KEY) {
  throw new Error("Missing ASSEMBLYAI_API_KEY.");
}
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});

export async function processMediaIntoClips({
  mediaURL,
  editConfig: {
    clipsLengthInSeconds = 60,
    clipsContentPrompt = "must be informing, engaging, important, key takeaways, main advice, core conclusions, some funny moments",
    clipsTitlePrompt = "must be eye-catching, suprising, interesting, emojis allowed",
  },
  minutesToAnalyze,
}: {
  mediaURL: string;
  editConfig: {
    clipsLengthInSeconds?: number;
    clipsContentPrompt?: string;
    clipsTitlePrompt?: string;
  };
  minutesToAnalyze: number;
}) {
  if (!mediaURL) {
    throw new Error("Media URL is required.");
  }
  if (!minutesToAnalyze) {
    throw new Error("Minutes to analyze is required.");
  }

  const mediaType = await getVideoTypeClassification(mediaURL)
  const youtubeInfo = mediaType === "youtube" ? await getYoutubeInfo(mediaURL) : undefined

  async function getDirectYoutubeURL() {
    const info = await ytdl.getInfo(mediaURL)

    const idealAudioFormatObject =
      info.formats.find((format) => format.itag === 37) ??
      info.formats.find((format) => format.itag === 22) ??
      info.formats.find((format) => format.itag === 18)

    if (!idealAudioFormatObject) {
      throw new Error("No audio format found in video. Please contact us.");
    }

    return idealAudioFormatObject.url;
  }
  if (mediaType === "youtube") {
    mediaURL = await getDirectYoutubeURL();
  }
  console.log(mediaURL)

  const secondsToAnalyze = minutesToAnalyze * 60;
  const params = {
    audio: mediaURL,
    audio_end_at: secondsToAnalyze * 1000, //in miliseconds
    speaker_labels: true,
    //language_detection: true,
  };
  const transcript = await client.transcripts.transcribe(params);

  let transcriptTextWithEmbeddedTimestamps = "@0 ";
  let currentSpeaker = undefined;

  const { sentences } = await client.transcripts.sentences(transcript.id);
  for (const sentence of sentences) {
    const speaker = sentence.speaker;
    const text = sentence.text;
    const sentenceEndTimeInMiliseconds = sentence.end;
    const sentenceEndTimeInSeconds = Math.round(sentenceEndTimeInMiliseconds / 1000)

    if (speaker !== currentSpeaker) {
      currentSpeaker = speaker;
      transcriptTextWithEmbeddedTimestamps += `Speaker ${currentSpeaker}: `;
    }
    transcriptTextWithEmbeddedTimestamps += `${text} @${sentenceEndTimeInSeconds} `;
  }

  console.log(transcriptTextWithEmbeddedTimestamps)

  const anthropicClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const claudePrompt = `
  Your goal is to select at least 5-10 clips that are relevant to the video's topic and engaging for the viewer. Follow these instructions carefully:

  1. You will be provided with the following inputs:
  <transcript>${transcriptTextWithEmbeddedTimestamps}</transcript>
  This is the video transcript, where each sentence begins and ends with a '@' symbol and includes a timestamp in seconds. The text's speaker is also included.

  <clip_topic>${clipsContentPrompt}</clip_topic>
  This is the user's prompt specifying what the clips should be about.

  <title_prompt>${clipsTitlePrompt}</title_prompt>
  This is the user's prompt on how to write a title for each clip.

  <clip_duration>${clipsLengthInSeconds}</clip_duration>
  This is the approximate duration desired for each clip.

  ${youtubeInfo &&
   `<video_title>${youtubeInfo?.title}</video_title>
    This is the video's title, which you should use to determine topic relevance.`
  }

  2. Process the transcript:
  - Identify potential clip start points that begin with engaging statements (bold, controversial, or surprising).

  3. Select interesting clips based on the following criteria:
  - Relevance to the clip_topic
  - Starts with an engaging statement
  - Approximately matches the specified clip_duration
  - Does not start in the middle of a sentence
  - The clip should preferably end at the conclusion of an idea

  4. Generate a title for each selected clip:
  - Use the title_prompt as guidance for creating the title
  - Ensure the title is concise, engaging, and relevant to the clip's content

  5. Format your output as a single line of JSON in the following structure:
  [
      {
      "start": startTimestamp,
      "end": endTimestamp,
      "title": "Title of the clip"
      },
      ...
  ]

  6. Additional guidelines:
  - Aim for at least 5-10 clips
  - Ensure clips are spread throughout the video, not clustered in one section
  - Avoid selecting clips that are too similar in content
  - Do not include any explanations or additional text in your output
  - Rank the clips, placing the most interesting and relevant ones at the beginning of the list

  Process the inputs, select the most interesting and relevant clips, and provide your output in the specified JSON format without any additional commentary. Do not hallucinate.
  `

  let amountOfAttempts = 0
  const maxAmountOfAttempts = 3
  
  let JSONParsedClaudeResponse
  while (amountOfAttempts < maxAmountOfAttempts) {
    try {
      const claudeResponse = await anthropicClient.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 3296,
        temperature: 1,
        system:
          "You are an AI assistant tasked with extracting the most interesting clips from a video transcript.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: claudePrompt,
              },
            ],
          },
        ],
      });
      
      JSONParsedClaudeResponse = JSON.parse((claudeResponse.content[0] as TextBlock).text)
      break
    } catch (error: any) {
      amountOfAttempts++
      console.error(`AI attempt ${amountOfAttempts}: ${error}`)
    }
  }
  if (!JSONParsedClaudeResponse) {
    throw new Error("AI failed to return parsable JSON even after multiple attempts.")
  }

  const clips: TClip[] = []
  for (const segment of JSONParsedClaudeResponse) {
    const clip = {
      title: segment.title,
      transcript: undefined,
      time: {
        start: Math.round(segment.start),
        end: Math.round(segment.end)
      },
      url: undefined
    }
    clips.push(clip)
  }


  return {
    clips,
    directURL: mediaURL,
  };
}