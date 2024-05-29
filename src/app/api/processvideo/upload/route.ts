import { AssemblyAI } from 'assemblyai'
import { NextRequest, NextResponse } from 'next/server'

import { utapi } from '@/server/uploadthing'

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || ""
})

export async function POST (req: NextRequest, res: NextResponse) {
    try {
        //const { videoURL } = reqBody
        const videoURL = "https://jackkhc.github.io/hostingThings/clipsfast/In%2010%20Minutes%20This%20Room%20Will%20Explode%20720p.mp4"
        const videoNameRegex = /^https:\/\/.+?\/([^\/]+)\.[^\/]+$/
        const videoName = videoURL.match(videoNameRegex)?.[1]
        const processedAudioExtension = "mp3"
        const processedAudioName = videoName + "." + processedAudioExtension

        const ffmpeg = require('fluent-ffmpeg')
        const fs = require('fs')

        //make video into audiourl NOWWW
        
        const relativeOutputFilePath = "./src/media/extracted_audio/"
        const outputFilePath = relativeOutputFilePath + processedAudioName

        await new Promise<void>((resolve, reject) => {
            ffmpeg(videoURL)
                .output(outputFilePath)
                .outputFormat(processedAudioExtension)
                .on("error", (error: any) => {
                    console.error(`Error processing audio: ${processedAudioName}`, error);
                    reject(error);
                })
                .on("progress", (progress: any) => {
                    console.log(`Processing frames for ${processedAudioName}: ${progress.frames}`);
                })
                .on("end", () => {
                    console.log(`Finished processing: ${processedAudioName}`);
                    resolve();
                })
                .run();
        })

        const audioBuffer = fs.readFileSync(outputFilePath)
        
        await utapi.uploadFiles(audioBuffer);

        return NextResponse.json(1)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to process transcript' })
    }
}