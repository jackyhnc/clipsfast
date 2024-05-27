import { AssemblyAI } from 'assemblyai'
import { NextRequest, NextResponse } from 'next/server'

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || ""
})

export async function POST (req: NextRequest, res: NextResponse) {
    try {
        const reqBody = await req.json()
        const { audioURL } = reqBody

        const params = {
            audio: audioURL,
        }
        const transcript = await client.transcripts.transcribe(params)

        const transcriptText = transcript.text
        const nestedTranscriptObjWithTimestamps: any = transcript.words
        const transcriptObjWithTimestamps = nestedTranscriptObjWithTimestamps.flat()

        let transcriptTextWithEmeddedTimeStamps = ""
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

        return NextResponse.json(transcriptTextWithEmeddedTimeStamps)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch transcript' })
    }
}