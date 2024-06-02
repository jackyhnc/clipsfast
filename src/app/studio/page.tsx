"use client"

import ImageUpload from "@/components/VideoUpload";
import VideoPlayer from "@/components/VideoPlayer";

import { useEffect, useState } from "react";

export default function MainPage() {

    return (
        //navbar
        <div className="">
            studio
        </div>
    )
}


/*
export default function MainApp() {
    const [videoURL, setVideoURL] = useState<Array<string>>([])
    const [videoPaths, setVideoPaths] = useState<Array<string>>([])

    const fetchTranscript = async (videoURL: string) => {
        try {
            const response = await fetch(`/api/autohighlights`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        videoURL: videoURL
                    }
                )
            })

            const fetchedVideoPaths = await response.json()
            setVideoPaths(fetchedVideoPaths)
            console.log(fetchedVideoPaths)
        } catch(error) {
            console.error(error)
        }
    }

    const handleUploadComplete = (res: { url: string }[]) => {
        const uploadedUrls = res.map(video => {
            return video.url
        })
        setVideoURL(uploadedUrls)



    }

    return (
        <main className="mx-8 flex flex-col items-center">
            <ImageUpload onUploadComplete={handleUploadComplete} />

            <div className="flex flex-wrap justify-center gap-12">
                <div className="h-[250px] flex">
                    <VideoPlayer url={"https://jackkhc.github.io/hostingThings/clipsfast/Rarest%20Pineapple%20World.mp4"}/>
                </div>

                
                {videoPaths.map((path: string) => {
                    return (
                        <div className="w-10" key={path}>
                            <VideoPlayer url={"https://jackkhc.github.io/hostingThings/clipsfast/Rarest%20Pineapple%20World.mp4"}/>
                        </div>
                    )
                })}
            </div>



        </main>
    )
}
*/