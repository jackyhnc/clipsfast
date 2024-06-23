import chalk from "chalk"
import { NextRequest, NextResponse } from "next/server"
import path from "path"

export const POST = async (req: NextRequest) => {
    try {
        const reqBody = await req.json()
        let { videoURL } = reqBody 
        const videoNameRegex = /^https:\/\/.+?\/([^\/]+)\.[^\/]+$/
        let videoName = decodeURIComponent(videoURL).match(videoNameRegex)?.[1] ?? "video_name"
        const videoExtensionRegex = /\.(?<extension>[^.\/?#]+)(?:\?|$)/ 
        const videoExtension = videoURL.match(videoExtensionRegex)?.groups?.extension ?? "mp4"

        const ffmpeg = require('fluent-ffmpeg');

        const isYoutubeLinkRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|user\/\S*#\S*\/\S*\/\S*\/|shorts\/)?|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
        if (isYoutubeLinkRegex.test(videoURL)) {
            const youtubeVideoURL = videoURL
            const downloadedYoutubeVideoPathResponse = await fetch("http://localhost:3000/api/autohighlights/downloadytvideo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        youtubeVideoURL: youtubeVideoURL
                    }
                )
            })
            if (!downloadedYoutubeVideoPathResponse.ok) {
                throw new Error(`Error: ${downloadedYoutubeVideoPathResponse.statusText}`);
            }

            const downloadedYoutubeVideoName = await downloadedYoutubeVideoPathResponse.json()
            if (downloadedYoutubeVideoName.error) {
                throw new Error(downloadedYoutubeVideoName.error);
            }

            console.log(chalk.blue("Video URL: " + videoURL))
            videoURL = downloadedYoutubeVideoName
            videoName = downloadedYoutubeVideoName
            //when url is youtube, videoURL for this api becomes the downloaded youtube video name (ex. watch=?id)
        }

        
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

        const chatgptRouteResponse = await fetch("http://localhost:3000/api/autohighlights/chatgpt/", {
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
        if (!chatgptRouteResponse.ok) {
            throw new Error("Error with ChatGPT api response");
        }
        const highlightedTimestamps = await chatgptRouteResponse.json()
        if (highlightedTimestamps.error) {
            throw new Error(highlightedTimestamps.error)
        }


        const outputFilePaths: Array<string> = []

        const inputVideoFileNameToEdit = `${videoName}.${videoExtension}`
        const relativeInputFilePathRouteToEdit = "./public/extracted_video/"    
        const relativeInputFilePathToEdit = path.join(relativeInputFilePathRouteToEdit, inputVideoFileNameToEdit)

        for (const highlightedTimestamp of highlightedTimestamps) {
            const { start, end, title } = highlightedTimestamp

            const startTimeInSeconds = start / 1000
            const endTimeInSeconds = end / 1000

            /*
            const indexOfhighlightedTimestamp = highlightedTimestamps.findIndex((time:any) => {
                return time.start === start && time.end === end
            })
            */

            const outputVideoFileName = `${title}.${videoExtension}`
            const relativeOutputFilePathRoute = "./public/edited_video/"
            const relativeOutputFilePath = path.join(relativeOutputFilePathRoute, outputVideoFileName)
    
            await new Promise<void>((resolve, reject) => {
                ffmpeg(relativeInputFilePathToEdit)
                    .output(relativeOutputFilePath)
                    .setStartTime(startTimeInSeconds)
                    .duration(endTimeInSeconds - startTimeInSeconds)
                    .size("1080x1920")
                    .videoCodec("libx264")
                    .audioCodec("libmp3lame")
                    .autopad()
                    .on("error", (error: any) => {
                        console.error(`Error editing video: ${outputVideoFileName}`, error);
                        reject(error);
                    })
                    .on("progress", (progress: any) => {
                        console.log(`Progress editing video: ${outputVideoFileName}: ${Math.floor(progress.percent)}%`);
                    })
                    .on("end", () => {
                        console.log(`Finished editing video: ${outputVideoFileName}`);
                        resolve();
                    })
                    .run();
            })
            const outputFilePath = relativeOutputFilePath.replace("public","") 
            //so when videoplayer uses these output links, it can use the root path without public in it

            outputFilePaths.push(outputFilePath)
        }

        const videoURLOutputPathsObject = {
            mediaURL: videoURL,
            editedClipsPaths: outputFilePaths
        }

        return NextResponse.json(videoURLOutputPathsObject)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to fetch processed video" })
    }
}