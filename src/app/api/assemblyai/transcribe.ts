import { AssemblyAI } from 'assemblyai'
import { NextRequest, NextResponse } from 'next/server'

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || ""
})

const getTranscript = async (req: NextRequest) => {
    try {
        const { audioURl } = req.body as any
        const audioURL2 = "https://github.com/AssemblyAI-Examples/audio-examples/raw/main/20230607_me_canadian_wildfires.mp3"

        const params = {
            audio: audioURL2,
        }

        const transcript = await client.transcripts.transcribe(params)

        const transcriptText = transcript.text
        const nestedTrasncriptTextWithTimestamps: any = transcript.words

        const transcriptTextWithTimestamps = nestedTrasncriptTextWithTimestamps.flat()


        type TTranscriptItemObject = {
            text: string,
            start: number | null,
            end: number | null,
        }

        const emptySentenceObj: TTranscriptItemObject = {
            text: "",
            start: null,
            end: null,
        }
        let currentSentenceObj = {...emptySentenceObj}

        const transcriptSentences = []


        for (const wordObj of transcriptTextWithTimestamps) {
            const word = wordObj.text
            
            if (currentSentenceObj.start === null) {
                currentSentenceObj.start = wordObj.start
            }
            if (word[word.length-1] === ".") {
                currentSentenceObj.text += word
                currentSentenceObj.end = wordObj.end
                transcriptSentences.push(currentSentenceObj)
                
                currentSentenceObj = {...emptySentenceObj}
                continue
            }
            
            currentSentenceObj.text += word + " "
        }
        if (currentSentenceObj.text !== "") {
            transcriptSentences.push(currentSentenceObj)
        } //push the last sentence bc sometimes no period at end

        return NextResponse.json({
            text: transcript.text,
            textWithTimeStamps: transcriptSentences
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch blocks' })
    }
}
export default getTranscript