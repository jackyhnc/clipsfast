import chalk from "chalk";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function chatgptAutoHighlights (transcriptTextWithEmeddedTimeStamps, videoLengthRangeInSeconds) {
    try {
        const videoLengthRangeInMiliseconds = videoLengthRangeInSeconds.map((value) => {value / 1000})
        const [videoLengthRangeInMilisecondsStart, videoLengthRangeInMilisecondsEnd] = videoLengthRangeInMiliseconds

        if (!transcriptTextWithEmeddedTimeStamps) {
            throw new Error({ error: 'Stopped AI from interpreting null or empty transcript.' })
        }
        const prompt = `
        I will provide a transcript where each sentence is followed by a '@' and a timestamp representing its position in the video. 
        Please identify the best segments from this transcript, in timestamps, for viewers seeking to learn and be entertained. 
        Each segment must be from ${videoLengthRangeInMilisecondsStart} to a max of ${videoLengthRangeInMilisecondsEnd}
        milliseconds long to provide substantial content. Provide an exciting title that hooks viewers, including emojis.

        Transcript:
        ${transcriptTextWithEmeddedTimeStamps}`

        const chatgptResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "user",
                    content: prompt
                },
                {
                    role: "system",
                    content: `You output no conversation, only the formatted timestamps in a list format in a single line of 
                    JSON: [ {start: startTimestamp, end: endTimestamp, title: titleOfSegment } ]. `
                },
            ],
            temperature: 1,
            max_tokens: 4095,
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