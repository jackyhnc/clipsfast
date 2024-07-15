"use client"

import VideoPlayer from "@/components/VideoPlayer";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Loading() {

    const [loadingState, setLoadingState] = useState(1)
    useEffect(() => {
        setTimeout(() => {
            setLoadingState(2)
        }, 1000)
        
        setTimeout(() => {
            setLoadingState(3)
        }, 10000)
    }, [])

    if (loadingState === 1) {
        return (
            <div className="w-lvw h-lvh flex items-center justify-center bg-[var(--bg-yellow-white)]">
            </div>
        )
    } else if (loadingState === 2) {
        return (
            <div className="w-lvw h-lvh flex items-center justify-center bg-[var(--bg-yellow-white)] flex-col">
                <div className="rounded-lg overflow-hidden">
                    <Image 
                        src={"https://media1.tenor.com/m/Lh66qN7XymwAAAAC/kumala-savesta.gif"}
                        alt="jake sigma loading gif"
                        width={300}
                        height={0}
                    />
                </div>
                <div className="text-center font-medium">Loading...</div>
            </div>
        )
    } else if (loadingState === 3) {
        return (
            <div className="w-lvw h-lvh flex items-center justify-center bg-[var(--bg-yellow-white)]">
                
                <div className="flex flex-col space-y-3">
                    <div className="flex flex-row gap-4 w-[700px] items-end">
                        <div className="w-[200px]">
                            <VideoPlayer
                                url="https://www.youtube.com/watch?v=nNGQ7kMhGuQ&" 
                                aspectRatio="8/16"
                                className="rounded-lg"
                                autoPlay={true}
                                controls={true}
                                clipStartTime={302}
                                muted={true}
                                loop={true}
                            />
                        </div>
                        <div className="w-full">
                            <VideoPlayer
                                url="https://www.youtube.com/watch?v=10gjsgA6fTE&p"
                                className="rounded-lg"
                                aspectRatio="16/9"
                                autoPlay={true}
                                controls={true}
                                clipStartTime={20}
                                muted={true}
                                loop={true}
                            />
                        </div>

                    </div>
                    <div className="text-center font-medium">Sorry for the long wait time. <br/> Here's some gameplay to keep you entertained 🙏.</div>
                </div>
            </div>
        )
    }
}
