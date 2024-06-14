"use client"

import { useState } from "react"
import { useContext, useEffect } from 'react';
import { MediaURLsContext } from '@/context/MediaURLsContext';
import { useRouter } from 'next/navigation';
import VideoPlayer from "@/components/VideoPlayer"

export default function ClipsDisplayPage() {
    const { mediaURLs } = useContext(MediaURLsContext)

    const router = useRouter()

    const [editedClipsPaths, setEditedClipsPaths] = useState<Array<string>>([])
    /*
        schema = {
            videoURL: "asfasdfas.com/lasdf.mp4"
            editedClipsPaths: [
                "asdfasdf1.mp4",
                "asdfasdf2.mp4",
                "asdfasdf3.mp4",
            ]
        }
    */
    const [fetchProgress, setFetchProgress] = useState<number>(0)
    
    const processMediaURLs = async () => {
        for (const mediaURL of mediaURLs) {
            try {
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
                if (!newEditedClipsResponse.ok) {
                    throw new Error(`Error: ${newEditedClipsResponse.statusText}`);
                }

                
    
                const newEditedClipsPaths: Array<string> = await newEditedClipsResponse.json()
                
                setEditedClipsPaths((prevEditedClipsPaths) => {return [...prevEditedClipsPaths, ...newEditedClipsPaths]})
            } catch(error) {
                console.error(error)
            }
        }
    }

    useEffect(() => {
        if (!mediaURLs.length) {
            alert("Please insert video files first before auto-edit can start.")
            router.push("upload")
        } else {
            processMediaURLs()
        }
    },[])

    return (
        <main className='px-20 py-10'>
            <div className="">asdf</div>
            <div className="rounded-lg bg-gray-200 flex flex-row justify-center items-center p-14">
                <div className="m-auto">
                    {mediaURLs.length ? 
                        <div className="flex flex-wrap gap-14 overflow-scroll">
                            {editedClipsPaths.map(path => {
                                const videoName = path.replace("/edited_video/","")
                                return (
                                    <div className="w-52 flex flex-col gap-3" key={path}>
                                        <div className="bg-gray-800 rounded-[4px] overflow-hidden">
                                            <VideoPlayer
                                                url={path} 
                                                aspectRatio="auto"
                                            />
                                        </div>
                                        <div className="text-sm line-clamp-2 break-words">{videoName}</div>
                                    </div>
                                )
                            })}
                        </div> 
                    : null}
                </div>
            </div>
        </main>
    )
}