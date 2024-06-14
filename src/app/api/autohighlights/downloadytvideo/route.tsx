import { NextRequest, NextResponse } from "next/server"
import ytdl from "ytdl-core"
import fs from "fs"

const sanitizeFilename = (filename: string) => {
    const invalidCharsRegex = /[^\w\s\-._(){}[\]~!,'@#$%+=]/g;

    const sanitizedFilename = filename.replace(invalidCharsRegex, '_');
    
    return sanitizedFilename.replace(/\s+/g, ' ').trim();
}; //sanitize file before ffmpeg can open it bc invalid characters form yt vid title

export const POST = async (req: NextRequest) => {
    try {
        const reqBody = await req.json()
        const { youtubeVideoURL } = reqBody

        const youtubeVideoInfo = await ytdl.getBasicInfo(youtubeVideoURL)

        const youtubeVideoTitle = youtubeVideoInfo.videoDetails.title
        const sanitizedYoutubeVideoTitle = sanitizeFilename(youtubeVideoTitle) //not sanitizing correctly
    
        const outputVideoName = "ytdl-" + sanitizedYoutubeVideoTitle ?? "ytdl-No_Youtube_Title"
        const outputVideoExtension = "mp4"
        const outputVideoFileName = `${outputVideoName}.${outputVideoExtension}`
        const relativeOutputFilePath = "./public/extracted_video/"
        const outputFilePath = relativeOutputFilePath + outputVideoFileName

        const downloadYoutubeVideo = async () => {
            return new Promise<void>((resolve, reject) => {
                const downloadStream = ytdl(youtubeVideoURL);
                const writeStream = fs.createWriteStream(outputFilePath);
        
                let totalSize = 0;
                let downloadedSize = 0;
                
                downloadStream.on('response', (res) => {
                    if (res.headers['content-length']) {
                        totalSize = parseInt(res.headers['content-length'], 10);
                    } else {
                        console.error('Content length not provided in response headers.');
                        reject(new Error('Content length not provided.'))
                    }
                });
    
                downloadStream.on('data', (chunk: Buffer) => {
                    downloadedSize += chunk.length;
    
                    const progress = (downloadedSize / totalSize) * 100
                    console.log(`Download progress: ${progress.toFixed(2)}%`)
                });
    
                downloadStream.on('end', () => {
                    console.log(`Total size: ${totalSize} bytes`);
                    console.log(`Downloaded size: ${downloadedSize} bytes`);
                    resolve()
                });
    
                downloadStream.on('error', (err: Error) => {
                    console.error('Error downloading the video:', err);
                    reject(err)
                });
    
                writeStream.on('error', (err: Error) => {
                    console.error('Error writing to the output file:', err);
                    reject(err)
                });
    
                downloadStream.pipe(writeStream);
            }
            )
        }
            
        await downloadYoutubeVideo()
        
        return NextResponse.json(outputVideoName)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to download YouTube video." })
    }
}