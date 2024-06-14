"use client"

import VideoPlayer from "@/components/VideoPlayer"
import VideoUploader from "@/components/VideoUpload"
import Popup from "@/components/Popup"
import RedirectButton from "@/components/RedirectButton"

import { useContext, useEffect, useState } from "react"

import { MediaURLsContext } from "@/context/MediaURLsContext"

const googleYoutubeAPIKey = process.env.GOOGLE_YOUTUBE_API_KEY

export default function UploadMediaPage() {
    const { mediaURLs, setMediaURLs } = useContext(MediaURLsContext)
    const [showUploadMediaMenu, setShowUploadMediaMenu] = useState<boolean>(false)

    function UploadMediaMenu() {
        const [inputLink, setInputLink] = useState<string>("")
        const [inputLinkErrorMsg, setInputLinkErrorMsg] = useState<string>("")

        useEffect(() => {
            setInputLinkErrorMsg("")
        }, [inputLink])

        const handleInsertLinkMediaURL = async () => {
            if (!inputLink) {
                setInputLinkErrorMsg("Link is undefined.")
                return
            } //return if url undefined
    
            try {
                const isYoutubeLinkRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|user\/\S*#\S*\/\S*\/\S*\/|shorts\/)?|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
                if (inputLink.match(isYoutubeLinkRegex)?.[1]) {
                    const youtubeVideoExistsResponse = await fetch("http://localhost:3000/api/checkifytvideoexists", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(
                            {
                                videoURL: inputLink
                            }
                        )
                    })
                    const youtubeVideoExists: boolean | { error: string } = await youtubeVideoExistsResponse.json()

                    if (!youtubeVideoExists) {
                        setInputLinkErrorMsg("Invalid YouTube link.")
                        return
                    }


                } else {
                    // check link thats not yt vid
                    const response = await fetch(inputLink, {
                        method: "HEAD"
                    })
    
                    if (!response?.ok) {
                        setInputLinkErrorMsg("Link is invalid.")
                        return
                    }
                }

                if (mediaURLs.includes(inputLink)) {
                    setInputLinkErrorMsg("Link has already been added.")
                }

                //download the yt video url, add mediaUrls w downlaoded video path. downloaded video paths in new folder in public
                //in assmeblyai, extract audio from yt video downlaoded path.
                setMediaURLs([...mediaURLs, inputLink])
                setInputLink("")
            } catch (error) {
                console.error('Error checking video accessibility:', error);
                setInputLinkErrorMsg("Error checking video accessibility.")
            }
        }

        const handleUploadComplete = (res: any) => {
            alert("upload complete")
            const newMediaURLs = res.map((item: any) => {
                return item.url
            })
            setMediaURLs([...mediaURLs, ...newMediaURLs])
        }

        return (
            showUploadMediaMenu && 
            <Popup title="Upload Videos" setPopupState={setShowUploadMediaMenu}>
                <div className="flex flex-col gap-10 mx-6 my-6">
                    <div className="flex flex-col gap-2 relative">
                        <div className="font-medium">Using Link</div>
                        <div className="flex rounded-xl border-2">
                            <input 
                                className="w-80 border-none rounded-l-xl bg-gray-50 outline-blue-300 pl-3"
                                autoFocus
                                value={inputLink}
                                onChange={e => setInputLink(e.target.value)}
                                type="text"
                            />
                            <button className="rounded-xl bg-[#ff0030] text-white px-3 
                                py-2 font-bold rounded-l-none"
                                onClick={() => handleInsertLinkMediaURL()}
                            >Upload</button>
                        </div>
                        <div className="text-red-500 absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-fit">{inputLinkErrorMsg}</div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="font-medium">Using Local Files</div>
                        <VideoUploader 
                            onUploadComplete={(res) => handleUploadComplete(res)}
                            appearance={{
                                button: `w-fit rounded-xl bg-[#ff0030] text-white p-2 font-bold 
                                ut-uploading:bg-[#f75e7a]`,
                                container: "self-start",
                                allowedContent: ""
                            }}
                            content={{
                                button({isUploading}) {
                                    if (isUploading) {
                                        return <div className="">Uploading...</div>
                                    }
                                    return <div className="font-bold cursor-pointer">Insert File</div>
                                },
                                allowedContent({isUploading}) {
                                    if (isUploading) {
                                        return<div className="text-xs line-clamp-2 text-center">Please wait for completion <br/> alert.</div>
                                    }
                                    return<div className="text-xs line-clamp-2 w-[120px]">Max Video Size: 1GB</div>
                                }
                            }}
                        />
                    </div>
                </div>

            </Popup>
        )
    }

    const [handleAutoEditVideosErrorMsg, setHandleAutoEditVideosErrorMsg] = useState<string>("")

    useEffect(() => {
        setHandleAutoEditVideosErrorMsg("")
    }, [mediaURLs])

    const handleAutoEditVideosError = () => {
        if (!mediaURLs.length) {
            setHandleAutoEditVideosErrorMsg("Insert a video first before editing.")
        }
    }

    return (
        <main className="px-20 py-10">
            <div className="flex flex-col gap-2">
                <div className="font-medium text-xl">Video Files</div>
                {mediaURLs.length ? <div className="rounded-lg bg-gray-200 flex gap-6 flex-row p-5 overflow-scroll w-fit">
                    {mediaURLs.map(url => {
                        return (
                            <div className="w-52 flex flex-col gap-3" key={url}>
                                <div className="bg-gray-800 rounded-[4px] overflow-hidden">
                                    <VideoPlayer 
                                        url={url} 
                                        aspectRatio="auto"
                                    />
                                </div>
                                <div className="text-sm line-clamp-2 break-words">{url}</div>
                            </div>
                        )
                    })}
                </div> : null}
            </div>
            <button
                className="mt-5 rounded-xl bg-[#ff0030] text-white px-4 py-2 font-bold" 
                onClick={() => setShowUploadMediaMenu(!showUploadMediaMenu)}
            >Upload Media</button>
            <UploadMediaMenu/>

            <div className="">            
                <div className="flex gap-6 mt-10 justify-end">
                    <button className="rounded-xl bg-[#8e8e8e] text-white p-3 font-bold h-fit">Continue to Editor</button>
                    <RedirectButton 
                        link="clips" 
                        stateOfLink={mediaURLs.length ? true : false}
                    >
                        <button 
                            className="rounded-xl bg-[#ff0030] text-white p-3 font-bold h-fit" 
                            onClick={() => handleAutoEditVideosError()}
                        >Auto Edit Videos</button>
                    </RedirectButton>
                </div>
                <div className="text-red-500 text-end w-full mt-2">{handleAutoEditVideosErrorMsg}</div>
            </div>
        </main>
    )
}