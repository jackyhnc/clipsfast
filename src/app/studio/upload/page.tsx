"use client"

import VideoPlayer from "@/components/VideoPlayer"
import VideoUploader from "@/components/VideoUpload"
import Popup from "@/components/Popup"

import { useEffect, useState, useRef } from "react"
import RedirectButton from "@/components/RedirectButton"

export default function UploadMediaPage() {
    const [mediaURLs, setMediaURLs] = useState<Array<string>>([])

    const [showUploadMediaMenu, setShowUploadMediaMenu] = useState<boolean>(false)

    const [inputLink, setInputLink] = useState<string>("")
    const [inputLinkErrorMsg, setInputLinkErrorMsg] = useState<string>("")

    useEffect(() => {
        setInputLinkErrorMsg("")
        console.log(inputLink)
    }, [inputLink])

    const handleInsertLinkMediaURL = async () => {
        if (!inputLink) {
            setInputLinkErrorMsg("Link is undefined.")
            return
        } //return if url undefined

        try {
            const response = await fetch(inputLink, {
                method: "HEAD"
            })

            if (response.ok) {
                if (mediaURLs.includes(inputLink)) {
                    setInputLinkErrorMsg("Link has already been added.")
                } else {
                    setMediaURLs([...mediaURLs, inputLink])
                    setInputLink("")
                }
            } else {
                setInputLinkErrorMsg("Link is invalid.")
            }
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

    function UploadMediaMenu(props: any) {
        const {inputLink, setInputLink} = props
        return (
            showUploadMediaMenu && 
            <Popup title="Upload Videos" setPopupState={setShowUploadMediaMenu}>
                <div className="flex flex-col gap-10 mx-6 my-6">
                    <div className="flex flex-col gap-2">
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
                        <div className="text-red-500 text-center">{inputLinkErrorMsg}</div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="font-medium">Using Local Files</div>
                        <VideoUploader 
                            onUploadComplete={(res) => handleUploadComplete(res)}
                            appearance={{
                                button: `w-fit rounded-xl bg-[#ff0030] text-white p-2 font-bold 
                                hover:cursor-pointer
                                ut-uploading:bg-[#f75e7a]`,
                                container: "self-start",
                                allowedContent: ""
                            }}
                            content={{
                                button({isUploading}) {
                                    if (isUploading) {
                                        return <div className="">Uploading...</div>
                                    }
                                    return <div className="font-bold">Insert File</div>
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
    const handleAutoEditVideosError = () => {
        if (!mediaURLs.length) {
            console.log(handleAutoEditVideosErrorMsg)
            setHandleAutoEditVideosErrorMsg("Insert a video first before editing.")
        }

    }

    return (
        <main className="m-20">
            <div className="flex flex-col gap-2">
                <div className="font-medium text-xl">Video Files</div>
                {mediaURLs.length ? <div className="rounded-lg bg-gray-200 flex gap-6 flex-row p-5 overflow-scroll w-fit">
                    {mediaURLs.map(url => {
                        return (
                            <div className="w-52 flex flex-col gap-3">
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
            <UploadMediaMenu inputLink={inputLink} setInputLink={setInputLink} />

            <div className="">            
                <div className="flex gap-6 mt-10 justify-end">
                    <button className="rounded-xl bg-[#8e8e8e] text-white p-3 font-bold h-fit">Continue to Editor</button>
                    <RedirectButton 
                        link="editing" 
                        stateOfLink={mediaURLs.length ? true : false}
                        data={mediaURLs}
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