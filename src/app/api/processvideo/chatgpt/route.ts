import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: NextRequest, res: NextResponse) => {
    try {
        const reqBody = await req.json()
        const { transcriptTextWithEmeddedTimeStamps } = reqBody

        if (!transcriptTextWithEmeddedTimeStamps) {
            return NextResponse.json({ error: 'Stopped AI from interpreting null / empty transcript.' })
        }
    
        const prompt = `
        I will provide a transcript where each sentence is followed by a '@' and then a timestamp
        representing its position in the video. The video begins at the timestamp of @0. From this transcript,
        I need you to identify the most captivating segments, in timestamps, for viewers seeking to learn and be
        entertained. Each segment must contain at least 110 words to provide substantial content. Please prioritize
        controversial statements that promote engagement.

        Transcript:
        ${transcriptTextWithEmeddedTimeStamps}`

        const chatgptResponse: any = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: [
                {
                    role: "user",
                    content: prompt
                },
                {
                    role: "system",
                    content: `You output no conversation, only the formatted timestamps 
                    in a list format in a single line of JSON: 
                    [ {start: startTimestamp, end: endTimestamp} ].
                    Output [] if the transcript is empty.`
                },
            ],
            temperature: 1,
            max_tokens: 7000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        let highlightedTimestamps
        try {
            highlightedTimestamps = JSON.parse(chatgptResponse.choices[0].message.content)
        } catch(error) {
            console.log({ "Chatgpt message": chatgptResponse.choices[0].message.content })
            return NextResponse.json({ error: 'Failed to parse the response from the AI.' })
        }

        console.log({
            reqBody: reqBody,
            highlightedTimestamps: highlightedTimestamps
        })

        return NextResponse.json(highlightedTimestamps)
    } catch(error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch transcript highlights' })
    }
}