import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || ""
})

export default async function assemblyAITranscript(videoURL) {
    try {
        const params = {
            audio: videoURL,
        }
        
        const transcript = await client.transcripts.transcribe(params)

        //const transcriptText = transcript.text
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