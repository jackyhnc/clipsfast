import { AssemblyAI } from 'assemblyai'
import path from 'path'
import Ffmpeg from 'fluent-ffmpeg'

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || ""
})

export async function assemblyAITranscript(videoURL) {
    try {
        const processedAudioExtension = "mp3"
        const appAudioRelativeOutputFilePath = "./public/extracted_audio/"

        const saveAudioFromYoutubeVideoURL = async (downloadedYoutubeVideoName) => {
            const downloadedYoutubeVideoFileName = `${downloadedYoutubeVideoName}.mp4`
            const appVideoRelativeOutputFilePath = "./public/extracted_video/"    
            const downloadedYoutubeVideoPath = path.join(appVideoRelativeOutputFilePath, downloadedYoutubeVideoFileName)

            const downloadedYoutubeAudioOutputPath = path.join(appAudioRelativeOutputFilePath, downloadedYoutubeVideoFileName)

            await new Promise((resolve, reject) => {
                ffmpeg(downloadedYoutubeVideoPath)
                    .output(downloadedYoutubeAudioOutputPath)
                    .outputFormat(processedAudioExtension)
                    .audioCodec('libmp3lame')
                    .on("error", (error) => {
                        console.error(`Error converting video to audio: ${downloadedYoutubeVideoName}`, error);
                        reject(error);
                    })
                    .on("progress", (progress) => {
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

        const saveAudioFromHostedVideoURL = async (videoURL) => {
            const videoNameRegex = /^(?:https?:\/\/)?(?:[^\/]+\/)?(.+)$/
            const videoName = videoURL.match(videoNameRegex)?.[1]
            const processedAudioFileName = videoName + "." + processedAudioExtension

            const audioOutputPath = path.resolve(appAudioRelativeOutputFilePath, processedAudioFileName)

            await new Promise((resolve, reject) => {
                Ffmpeg(videoURL)
                    .output(audioOutputPath)
                    .outputFormat(processedAudioExtension)
                    .audioCodec('libmp3lame')
                    .on("error", (error) => {
                        console.error(`Error converting video to audio: ${processedAudioFileName}`, error);
                        reject(error);
                    })
                    .on("progress", (progress) => {
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
        const nestedTranscriptObjWithTimestamps = transcript.words
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
        return transcriptTextWithEmeddedTimeStamps
    } catch (error) {
        console.error(error)
        return { error: 'Failed to process transcript' }
    }
}