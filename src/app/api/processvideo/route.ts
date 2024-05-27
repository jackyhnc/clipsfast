import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        //const { videoURL } = req.body as any

        const videoURL = "https://github.com/AssemblyAI-Examples/audio-examples/raw/main/20230607_me_canadian_wildfires.mp3"

        const assemblyaiResponse = await fetch("http://localhost:3000/api/processvideo/assemblyai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    audioURL:videoURL
                }
            )
        })
        const transcriptTextWithEmeddedTimeStamps = await assemblyaiResponse.json()

        const chatgptResponse = await fetch("http://localhost:3000/api/processvideo/chatgpt/", {
            method: "POST", 
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    transcriptTextWithEmeddedTimeStamps:transcriptTextWithEmeddedTimeStamps
                }
            )
        })
        const highlightedTimestamps = await chatgptResponse.json()

        return NextResponse.json(highlightedTimestamps)
    } catch (error) {
        console.error(error)
    }
}