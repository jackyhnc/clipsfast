import chalk from "chalk";
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
            return NextResponse.json({ error: 'Stopped AI from interpreting null or empty transcript.' })
        }
    
        const prompt = `
        I will provide a transcript where each sentence is followed by a '@' and a timestamp representing its position in the video. 
        Please identify the most captivating segments from this transcript, in timestamps, for viewers seeking to learn and be entertained. 
        Each segment must be 20000 to 60000 milliseconds long to provide substantial content. Provide an exciting title that hooks 
        viewers, in lower-case, including emojis. Please prioritize content that promotes engagement.

        Transcript:
        ${transcriptTextWithEmeddedTimeStamps}`

        const chatgptResponse: any = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "user",
                    content: prompt
                },
                {
                    role: "system",
                    content: `You output no conversation, only the formatted timestamps in a list format in a single line of 
                    JSON: [ {start: startTimestamp, end: endTimestamp, title: titleOfSegment } ]. 
                    Output [] if the transcript is empty.`
                },
            ],
            temperature: 1,
            max_tokens: 4096,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        let highlightedTimestamps
        try {
            highlightedTimestamps = JSON.parse(chatgptResponse.choices[0].message.content)
            console.log(chalk.green(JSON.stringify(highlightedTimestamps, null, 2)))
        } catch(error) {
            console.log({ "Chatgpt message": chatgptResponse.choices[0].message.content })
            return NextResponse.json({ error: 'Failed to parse the response from the AI.' })
        }

        return NextResponse.json(highlightedTimestamps)
    } catch(error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch transcript highlights' })
    }
}