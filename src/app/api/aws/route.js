import { NextResponse } from 'next/server'
import YTDLAudioOnly from './actions/YTDLAudioOnly.mjs'
import assemblyAITranscript from './actions/assemblyAITranscript.mjs'
import chatgptAutoHighlights from './actions/chatgptAutoHighlights.mjs'

export const POST = async () => {
    try {
        const yt = await YTDLAudioOnly("https://www.youtube.com/watch?v=2TL3DgIMY1g")
        if (yt?.error) {
            throw new Error(yt?.error)
        }
    
        const embeddedTranscript = await assemblyAITranscript(yt.url)
        if (embeddedTranscript?.error) {
            throw new Error(embeddedTranscript?.error)
        }
    
        const responseParams = {
            transcriptTextWithEmeddedTimeStamps: embeddedTranscript,
            videoLengthRangeInSeconds: [0, 1000],
        }
        const response = await chatgptAutoHighlights(responseParams)
        if (response?.error) {
            throw new Error(response?.error)
        }
        console.log(response)

        return NextResponse.json(response)

    } catch (error) {
        return NextResponse.json(error)
    }
}