import { NextRequest, NextResponse } from "next/server";
import ytdl from "ytdl-core";

export async function POST (req: NextRequest, res: NextResponse) {
    try {
        const reqBody = await req.json()
        const { videoURL } = reqBody

        const YTDLResponse = ytdl.validateURL(videoURL)

        return NextResponse.json(YTDLResponse ? true : false)
    } catch (error) {
        console.error(error)
        return NextResponse.json(false)
    }
}