import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const findHighlightsOfVideo = async (req: NextRequest, res: NextResponse) => {
    try {
        const { transcript } = req.body as any

        const transcriptText = transcript.text
        const transcriptTextWithTimestamps = transcript.textWithTimeStamps
    
        const prompt = `${transcript}`
    
        const chatgptResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: [{
                role: "user",
                content: prompt
            }],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
    
        return 
    } catch(error) {
        console.error(error)
    }
}
export default findHighlightsOfVideo