"use client"

import { useState, useEffect, useContext } from "react"
import { useQueries } from "@tanstack/react-query"

import { MediaURLsContext } from '@/context/MediaURLsContext';

import { useRouter } from 'next/navigation';
import VideoPlayer from "@/components/VideoPlayer"
//import chalk from "chalk";

import { uploadProcessMedia } from "@/actions/uploadProcessMedia"

export default function ClipsDisplayPage() {
    const { mediaURLs } = useContext(MediaURLsContext)

    type TEditedClipsPathsObject = {
        mediaURL: string,
        editedClipsPaths: Array<string>,
    }
    type TEditedClipsPathsObjects = Array<TEditedClipsPathsObject>
    const [editedClipsPathsObjects, setEditedClipsPathsObjects] = useState<TEditedClipsPathsObjects>([])

    function RedirectionPage() {
        return (
            <div className="">redirecting</div>
        )
    }
    const router = useRouter()
    useEffect(() => {
        if (!mediaURLs || !mediaURLs.length) {
            //alert("Please insert a video file first before auto-edit can start.")
            router.push("upload")
        }
    },[mediaURLs, router])
    if (!mediaURLs || !mediaURLs.length) {
        return (<RedirectionPage/>)
    }

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
    
    const editedClipsPathsObjectsQueries = mediaURLs.map(mediaURL => {
        return {
            queryKey: ["editedClipsObjectsPaths", mediaURL],
            queryFn: async () => {
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

                
                const newEditedClipsPathsObjects: TEditedClipsPathsObject = await newEditedClipsResponse.json()
                return newEditedClipsPathsObjects
            },
            staleTime: Infinity,    
        }
    })
    const { 
            pendingEditedClipsPathsObjectsQueries, 
            isEditedClipsPathsObjectsQueriesError, 
            editedClipsPathsObjectsQueriesError, 
            editedClipsPathsObjectsQueriesData 
        } = useQueries(
            {
                queries: editedClipsPathsObjectsQueries,
                combine: (results) => {
                    return {
                        pendingEditedClipsPathsObjectsQueries: results.filter((query) => query.isPending),
                        isEditedClipsPathsObjectsQueriesError: results.some((query) => query.isError),
                        editedClipsPathsObjectsQueriesError: results.map((query) => query?.error),
                        editedClipsPathsObjectsQueriesData: results.map((query) => query.data),
                    }
                }
            }
    )
    if (isEditedClipsPathsObjectsQueriesError) {
        console.log(editedClipsPathsObjectsQueriesError?.toString())
    }
    useEffect(() => {
        const newEditedClipsPathsObjects: Array<TEditedClipsPathsObject> = 
        editedClipsPathsObjectsQueriesData.filter((clipsPathsObject): clipsPathsObject is TEditedClipsPathsObject => {
            return clipsPathsObject !== undefined
        })

        setEditedClipsPathsObjects(newEditedClipsPathsObjects)
    }, [editedClipsPathsObjectsQueriesData])

    function ErrorPage() {
        return (
            <div className="">{editedClipsPathsObjectsQueriesError?.toString()}</div>
        )
    }

    function PendingPage() {
        return (
            <div className="">please wait bro</div>
        )
    }

    function DefaultPage() {
        return (
            <main className='px-20 py-10'>
                <div className="flex flex-col gap-12">
                    {editedClipsPathsObjects.map((editedClipsPathsObject) => {
                        const editedClipsMediaURL = editedClipsPathsObject.mediaURL
                        const editedClipsPaths = editedClipsPathsObject.editedClipsPaths

                        return (
                            <div className="" key={editedClipsMediaURL}>
                                <div className="">{editedClipsMediaURL}</div>

                                <div className="rounded-lg bg-gray-200 flex flex-row gap-24 p-14">
                                    {editedClipsPaths.map((path) => {
                                        const videoName = path.replace("/edited_video/","")
                                        
                                        return (
                                            <div className="w-52 flex flex-col gap-3" key={path}>
                                                <div className="bg-gray-800 rounded-[4px] overflow-hidden">
                                                    <VideoPlayer
                                                        url={path} 
                                                        aspectRatio="auto"
                                                    />
                                                </div>
                                                <div className="text-sm line-clamp-3 break-words">{videoName}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                        )
                    })}
                </div>

                {/**
                <div className="">asdf</div>
                <div className="rounded-lg bg-gray-200 flex flex-row justify-center items-center p-14">
                    <div className="m-auto">
                        {mediaURLs.length ? 
                            <div className="flex flex-wrap gap-14 overflow-scroll">
                                {editedClipsPathsObjects.map(mediaURLObject => {
                                    const path = mediaURLObject.editedClipsPaths


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
                 */}
            </main>
        )
    }


    if (isEditedClipsPathsObjectsQueriesError) {
        return <ErrorPage />

    } else if (pendingEditedClipsPathsObjectsQueries.length) {
        return <PendingPage />

    } else {
        return <DefaultPage />
        
    }
}