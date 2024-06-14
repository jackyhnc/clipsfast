import { AssemblyAI } from 'assemblyai'
import chalk from 'chalk'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || ""
})

export async function POST (req: NextRequest, res: NextResponse) {
    try {
        const ffmpeg = require('fluent-ffmpeg')

        const reqBody = await req.json()
        const { videoURL } = reqBody

        const processedAudioExtension = "mp3"
        const appAudioRelativeOutputFilePath = "./public/extracted_audio/"


        const saveAudioFromYoutubeVideoURL = async (downloadedYoutubeVideoName: string) => {
            const downloadedYoutubeVideoFileName = `${downloadedYoutubeVideoName}.mp4`
            const appVideoRelativeOutputFilePath = "./public/extracted_video/"    
            const downloadedYoutubeVideoPath = path.join(appVideoRelativeOutputFilePath, downloadedYoutubeVideoFileName)

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

        const saveAudioFromHostedVideoURL = async (videoURL:string) => {
            const videoNameRegex = /^(?:https?:\/\/)?(?:[^\/]+\/)?(.+)$/
            const videoName = videoURL.match(videoNameRegex)?.[1]
            const processedAudioFileName = videoName + "." + processedAudioExtension

            const audioOutputPath = path.resolve(appAudioRelativeOutputFilePath, processedAudioFileName)

            await new Promise<void>((resolve, reject) => {
                ffmpeg(videoURL)
                    .output(audioOutputPath)
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

            return audioOutputPath
        }

        let audioOutputFilePath
        const videoURLIsYoutubeVideoRegex = /.*ytdl-*/
        if (videoURLIsYoutubeVideoRegex.test(videoURL)) {
            audioOutputFilePath = await saveAudioFromYoutubeVideoURL(videoURL)
        } else {
            audioOutputFilePath = await saveAudioFromHostedVideoURL(videoURL)
        }

        const params = {
            audio: audioOutputFilePath,
        }
        
        const transcript = await client.transcripts.transcribe(params)

        const transcriptText = transcript.text
        const nestedTranscriptObjWithTimestamps: any = transcript.words
        const transcriptObjWithTimestamps = nestedTranscriptObjWithTimestamps.flat()

        let transcriptTextWithEmeddedTimeStamps = "@0"
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
        console.log(chalk.bgCyan(transcriptTextWithEmeddedTimeStamps))
        return NextResponse.json(transcriptTextWithEmeddedTimeStamps)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to process transcript' })
    }
}