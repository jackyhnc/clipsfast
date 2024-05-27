import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid'

export const POST = async (req: NextRequest, res: NextResponse) => {
    try {
        const ffmpeg = require('fluent-ffmpeg');

        const reqBody = await req.json()
        const { videoURL, highlightedTimestamps } = reqBody
        //const videoURL = "https://s3-ap-southeast-2.amazonaws.com/shotstack-assets/footage/skater.hd.mp4"
        //const highlightedTimestamps = [{start:14,end:24}]

        const videoLength: number = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoURL, (err: any, metadata: any) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(metadata.format.duration)
                }
            })
        })

        const outputFilePaths = []

        for (const highlightedTimestamp of highlightedTimestamps) {
            const { start, end } = highlightedTimestamp

            const processedVideoName = uuidv4() + ".mp4"
            const outputFilePath = "./src/app/videos/" + processedVideoName
    
            ffmpeg(videoURL)
                .save(outputFilePath)
                .videoCodec("libx264")
                .setStartTime(start)
                .duration(end - start)
                .size("1080x1920")
                .autopad()
    
                .on("error", (error:any) => {console.log(error)})
                .on("progress", (progress:any) => {console.log(`Process frames for ${processedVideoName}: ` + progress.frames)})
                .on("end", () => {console.log("Finished processing: " + processedVideoName)})
            
            outputFilePaths.push(outputFilePath)
        }

        return NextResponse.json(outputFilePaths)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to edit and trim video" })
    }
}