"use client"

import ImageUpload from "@/components/VideoUpload";
import VideoPlayer from "@/components/VideoPlayer";

import { useEffect, useState } from "react";

type TMainLayoutProps = {
    children: React.ReactNode
}

export default function MainLayout({children}: TMainLayoutProps) {

    return (
        //navbar
        <>       
            <nav className="bg-gray-300 h-[50px] w-full fixed top-0 z-[100]">

            </nav>
            
            {children}
        </>
    )
}
