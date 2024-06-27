import path from "path" 
import { youtubeDownload } from "./actions/youtubedownload.mjs"
import { assemblyAITranscript } from "./actions/assemblyai.mjs"
import Ffmpeg from "fluent-ffmpeg"
import { v4 as uuid } from "uuid"

export const handler = async (event) => {
  try {
        let { videoURL } = event 
        const videoNameRegex = /^https:\/\/.+?\/([^\/]+)\.[^\/]+$/
        let videoName = decodeURIComponent(videoURL).match(videoNameRegex)?.[1] ?? ("video_name_" + uuid())
        const videoExtensionRegex = /\.(?<extension>[^.\/?#]+)(?:\?|$)/ 
        const videoExtension = videoURL.match(videoExtensionRegex)?.groups?.extension ?? "mp4"

        const isYoutubeLinkRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|user\/\S*#\S*\/\S*\/\S*\/|shorts\/)?|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
        if (isYoutubeLinkRegex.test(videoURL)) {
            const youtubeVideoURL = videoURL

            youtubeDownload(youtubeVideoURL)

            videoURL = downloadedYoutubeVideoName
            videoName = downloadedYoutubeVideoName
            //when url is youtube, videoURL for this api becomes the downloaded youtube video name (ex. watch=?id)
        }

        const transcript = assemblyAITranscript(videoURL)
        
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


        const outputFilePaths = []

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
    
            await new Promise((resolve, reject) => {
                Ffmpeg(relativeInputFilePathToEdit)
                    .output(relativeOutputFilePath)
                    .setStartTime(startTimeInSeconds)
                    .duration(endTimeInSeconds - startTimeInSeconds)
                    .size("1080x1920")
                    .videoCodec("libx264")
                    .audioCodec("libmp3lame")
                    .autopad()
                    .on("error", (error) => {
                        console.error(`Error editing video: ${outputVideoFileName}`, error);
                        reject(error);
                    })
                    .on("progress", (progress) => {
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

        return videoURLOutputPathsObject
    } catch (error) {
        console.error(error)
        return { error: "Failed to fetch processed video" }
    }
};

