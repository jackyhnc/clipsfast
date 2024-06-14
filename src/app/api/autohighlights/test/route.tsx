import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import chalk from "chalk"


export async function POST (req: NextRequest, res: NextResponse) {
    try {
        const ffmpeg = require('fluent-ffmpeg')


        const videoURL = "ytdl-pen234$is "

        const processedAudioExtension = "mp3"
        const appAudioRelativeOutputFilePath = "./public/extracted_audio/"


        const saveAudioFromYoutubeVideoURL = async (downloadedYoutubeVideoName: string) => {
            const downloadedYoutubeVideoFileName = `${downloadedYoutubeVideoName}.mp4`
            const appVideoRelativeInputFilePath = "./public/extracted_video/"    
            const downloadedYoutubeVideoPath = path.join(appVideoRelativeInputFilePath, downloadedYoutubeVideoFileName)
            console.log(chalk.green(downloadedYoutubeVideoPath))

            const downloadedYoutubeAudioOutputPath = path.join(appAudioRelativeOutputFilePath, downloadedYoutubeVideoFileName)

            await new Promise<void>((resolve, reject) => {
                ffmpeg(downloadedYoutubeVideoPath)
                    .output(downloadedYoutubeAudioOutputPath)
                    .outputFormat(processedAudioExtension)
                    .audioCodec('libmp3lame')
                    .on("error", (error: any) => {
                        console.error(`Error converting video to audio: ${downloadedYoutubeVideoName}`, error);
                        reject(error);
                    })
                    .on("progress", (progress: any) => {
                        console.log(`Progress converting video to audio ${downloadedYoutubeVideoName}: ${Math.floor(progress.percent)}%`);
                    })
                    .on("end", () => {
                        console.log(`Finished converting video to audio: ${downloadedYoutubeVideoName}`);
                        resolve();
                    })
                    .run();
            })

            return downloadedYoutubeAudioOutputPath
        };

        let outputFilePath
        const videoURLIsYoutubeVideoRegex = /.*ytdl-*/
        if (videoURLIsYoutubeVideoRegex.test(videoURL)) {
            console.log(chalk.red("ytvideo"))
            outputFilePath = await saveAudioFromYoutubeVideoURL(videoURL)
        } 

        return NextResponse.json(outputFilePath)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to process transcript' })
    }
}