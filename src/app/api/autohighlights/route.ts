import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { videoURL } = req.body as any
        const videoNameRegex = /^https:\/\/.+?\/([^\/]+)\.[^\/]+$/
        const videoName = videoURL.match(videoNameRegex)?.[1]
        const videoExtensionRegex = /\.(?<extension>[^.\/?#]+)(?:\?|$)/ 
        const videoExtension = videoURL.match(videoExtensionRegex)?.groups?.extension ?? "mp4"

        const ffmpeg = require('fluent-ffmpeg');
        
        const assemblyaiRouteResponse = await fetch("http://localhost:3000/api/autohighlights/assemblyai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    videoURL: videoURL
                }
            )
        })
        if (!assemblyaiRouteResponse.ok) {
            throw new Error("Error with AssemblyAI api response");
        }
        const transcriptTextWithEmeddedTimeStamps = await assemblyaiRouteResponse.json()
        if (transcriptTextWithEmeddedTimeStamps.error) {
            throw new Error(transcriptTextWithEmeddedTimeStamps.error)
        }

        const chatgpRouteResponse = await fetch("http://localhost:3000/api/autohighlights/chatgpt/", {
            method: "POST", 
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    transcriptTextWithEmeddedTimeStamps: transcriptTextWithEmeddedTimeStamps
                }
            )
        })
        if (!chatgpRouteResponse.ok) {
            throw new Error("Error with ChatGPT api response");
        }
        const highlightedTimestamps = await chatgpRouteResponse.json()
        if (highlightedTimestamps.error) {
            throw new Error(highlightedTimestamps.error)
        }

        const outputFilePaths = []
        console.log(highlightedTimestamps)

        for (const highlightedTimestamp of highlightedTimestamps) {
            const { start, end } = highlightedTimestamp

            const startTimeInSeconds = start / 1000
            const endTimeInSeconds = end / 1000

            const indexOfhighlightedTimestamp = highlightedTimestamps.findIndex((time:any) => {
                return time.start === start && time.end === end
            })
            const processedVideoName = videoName + indexOfhighlightedTimestamp + "." + videoExtension
            const relativeOutputFilePath = "./public/edited_videos/"
            const outputFilePath = relativeOutputFilePath + processedVideoName
    
            await new Promise<void>((resolve, reject) => {
                ffmpeg(videoURL)
                    .output(outputFilePath)
                    .setStartTime(startTimeInSeconds)
                    .duration(endTimeInSeconds - startTimeInSeconds)
                    .size("1080x1920")
                    .videoCodec("libx264")
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

            outputFilePaths.push(outputFilePath)
        }

        return NextResponse.json(outputFilePaths)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to fetch processed video" })
    }
}