import { AssemblyAI } from 'assemblyai'
import { NextRequest, NextResponse } from 'next/server'

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || ""
})

export async function POST (req: NextRequest, res: NextResponse) {
    try {
        const reqBody = await req.json()
        const { videoURL } = reqBody
        const videoNameRegex = /^https:\/\/.+?\/([^\/]+)\.[^\/]+$/
        const videoName = videoURL.match(videoNameRegex)?.[1]
        const processedAudioExtension = "mp3"
        const processedAudioFileName = videoName + "." + processedAudioExtension
        const ffmpeg = require('fluent-ffmpeg')
        const fs = require('fs')
        
        const relativeOutputFilePath = "./public/extracted_audio/"
        const outputFilePath = relativeOutputFilePath + processedAudioFileName
        
        await new Promise<void>((resolve, reject) => {
            ffmpeg(videoURL)
                .output(outputFilePath)
                .outputFormat(processedAudioExtension)
                .audioCodec('libmp3lame')
                .on("error", (error: any) => {
                    console.error(`Error converting video to audio: ${processedAudioFileName}`, error);
                    reject(error);
                })
                .on("progress", (progress: any) => {
                    console.log(`Progress converting video to audio ${processedAudioFileName}: ${Math.floor(progress.percent)}%`);
                })
                .on("end", () => {
                    console.log(`Finished converting video to audio: ${processedAudioFileName}`);
                    resolve();
                })
                .run();
        })

        const params = {
            audio: outputFilePath,
        }
        
        const transcript = await client.transcripts.transcribe(params)

        const transcriptText = transcript.text
        const nestedTranscriptObjWithTimestamps: any = transcript.words
        const transcriptObjWithTimestamps = nestedTranscriptObjWithTimestamps.flat()

        let transcriptTextWithEmeddedTimeStamps = ""
        for (const wordObj of transcriptObjWithTimestamps) {
            let word = wordObj.text

            if (transcriptObjWithTimestamps[transcriptObjWithTimestamps.length-1] === wordObj) {
                word += `@${wordObj.end}`
            } else if (/[.?!]$/.test(word)) {
                word += `@${wordObj.end}` + " "
            }
            else {
                word += " "
            }
            transcriptTextWithEmeddedTimeStamps += word
        }

        return NextResponse.json(transcriptTextWithEmeddedTimeStamps)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to process transcript' })
    }
}