"use client"

import VideoPlayer from "@/components/VideoPlayer"
import VideoUploader from "@/components/VideoUpload"
import Popup from "@/components/Popup"

import { useEffect, useState, useRef } from "react"
import { redirect } from 'next/navigation'
import Link from "next/link"

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

    const handleUploadComplete = () => {
        alert("upload complete")
    }

    function UploadMediaMenu(props:any) {
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
                            onUploadComplete={handleUploadComplete}
                            appearance={{
                                button: "w-fit rounded-xl bg-[#ff0030] text-white px-3 py-2 font-bold",
                                container: "self-start",
                                allowedContent: ""
                            }}
                            content={{
                                button: <div className="w-fit rounded-xl bg-[#ff0030] text-white p-2 font-bold">Insert File</div>,
                                allowedContent: <div className="text-xs">Video</div>
                            }}
                        />
                    </div>
                </div>

            </Popup>
        )
    }
            //

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

            <div className="flex gap-6 mt-10 justify-end">
                <button className="rounded-xl bg-[#8e8e8e] text-white p-3 font-bold">Continue to Editor</button>
                <Link className="rounded-xl bg-[#ff0030] text-white p-3 font-bold"
                    href="/"
                >Auto Edit Videos</Link>
            </div>

        </main>
    )
}