import { AssemblyAI } from 'assemblyai'
import { NextRequest, NextResponse } from 'next/server'

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || ""
})

export const GET = async (req: NextRequest) => {
    try {
        //const { audioURl } = req.params
        const audioURL = "https://github.com/AssemblyAI-Examples/audio-examples/raw/main/20230607_me_canadian_wildfires.mp3"

        const params = {
            audio: audioURL,
        }

        const transcript = await client.transcripts.transcribe(params)

        return NextResponse.json({
            text: transcript.text,
            textWithTimeStamps: transcript.words,
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch blocks' })
    }
}