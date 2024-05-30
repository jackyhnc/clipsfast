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
        const videoExtensionRegex = /\.(?<extension>[^.\/?#]+)(?:\?|$)/ 
        const videoExtension = videoURL.match(videoExtensionRegex)?.groups?.extension ?? "mp4"
        const processedVideoName = videoName + "." + videoExtension

        const ffmpeg = require('fluent-ffmpeg')
        const fs = require('fs')

        //make video into audiourl NOWWW
        
        const relativeOutputFilePath = "./src/media/edited_videos/"
        const outputFilePath = relativeOutputFilePath + processedVideoName

        const start = 30
        const end = 26
        await new Promise<void>((resolve, reject) => {
            ffmpeg(videoURL)
                .output(outputFilePath)
                .duration(10)
                .size("1080x1920")
                .videoCodec('libx264')
                .audioCodec("libmp3lame")
                .autopad()
                .on("error", (error: any) => {
                    console.error(`Error editing video: ${processedVideoName}`, error);
                    reject(error);
                })
                .on("progress", (progress: any) => {
                    console.log(`Progress editing video ${processedVideoName}: ${Math.floor(progress.percent)}%`);
                })
                .on("end", () => {
                    console.log(`Finished editing video: ${processedVideoName}`);
                    resolve();
                })
                .run();
        })

        return NextResponse.json(1)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to process transcript' })
    }
}