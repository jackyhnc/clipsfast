"use client";

import ImageUpload from "@/components/video-upload";
import VideoPlayer from "@/components/video-player";

import { useEffect, useState } from "react";


export default function MainApp() {
    const [videoUrls, setVideoUrls] = useState<string[]>([])

    const handleUploadComplete = (res: { url: string }[]) => {
        console.log(res)
        const uploadedUrls = res.map(video => {
            return video.url
        })
        setVideoUrls([...videoUrls, ...uploadedUrls])
    }

    const [data, setData] = useState()
    const fetchTranscript = async () => {
        try {
            const response = await fetch(`/api/assemblyai/`, {
                method: "GET"
            })

            const fetchedData = await response.json()
            setData(fetchedData)
            console.log(fetchedData)
        } catch(error) {
            console.error(error)
        }
    }
    

    return (
        <main className="mx-8 flex flex-col items-center">
            <ImageUpload onUploadComplete={handleUploadComplete} />
            <div className="" onClick={fetchTranscript}>button</div>

            <div className="flex flex-wrap justify-center gap-12">
                {videoUrls.map(url => {
                    return (
                        <div className="max-w-56">
                            <VideoPlayer url={url}/>
                        </div>
                    )
                })}
            </div>



        </main>
    )
}
