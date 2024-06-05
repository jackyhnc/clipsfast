"use client"

import { useState } from "react"
import { useContext, useEffect } from 'react';
import { MediaURLsContext } from '@/context/MediaURLsContext';
import { useRouter } from 'next/navigation';
import VideoPlayer from "@/components/VideoPlayer"

export default async function ClipsDisplayPage() {
    const { mediaURLs } = useContext(MediaURLsContext)
    console.log(mediaURLs)

    const router = useRouter()

    const [editedClipsPaths, setEditedClipsPaths] = useState<Array<string>>([])

    useEffect(() => {
        if (!mediaURLs.length) {
            alert("Please insert video files first before auto-edit can start.")
            router.push("upload")
        }
        
        const processMediaURLs = async () => {
            for (const mediaURL of mediaURLs) {
                const newEditedClipsResponse = await fetch("http://localhost:3000/api/autohighlights", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        {
                            videoURL: mediaURL
                        }
                    )
                })

                const newEditedClipsPaths: Array<string> = await newEditedClipsResponse.json()

                setEditedClipsPaths([...editedClipsPaths, ...newEditedClipsPaths])
            }
        }
        processMediaURLs()
    },[])
    //cant make a promise async func inside useeffect hook

    return (
        <main className='m-20'>
            <div className="">asdf</div>
            {mediaURLs.length ? <div className="rounded-lg bg-gray-200 flex gap-6 flex-row p-5 overflow-scroll w-fit">
                {editedClipsPaths.map(path => {
                    return (
                        <div className="w-52 flex flex-col gap-3" key={path}>
                            <div className="bg-gray-800 rounded-[4px] overflow-hidden">
                                <VideoPlayer
                                    url={path} 
                                    aspectRatio="auto"
                                />
                            </div>
                            <div className="text-sm line-clamp-2 break-words">{path}</div>
                        </div>
                    )
                })}
            </div> : null}
            
        </main>
    )
}

//how to get data from links from anotehr page