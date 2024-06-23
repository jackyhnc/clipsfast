"use client"

import { useState, createContext } from "react"

type TMediaURLsContextProps = {
    mediaURLs: Array<string>,
    setMediaURLs: React.Dispatch<React.SetStateAction<Array<string>>>,
}

const defaultContext: TMediaURLsContextProps = {
    mediaURLs: [],
    setMediaURLs: () => {},
}
export const MediaURLsContext = createContext<TMediaURLsContextProps>(defaultContext)

export default function MediaURLContextProvider({children}: {children: React.ReactNode}) {
    const [mediaURLs, setMediaURLs] = useState<Array<string>>([])
    
    return (
        <MediaURLsContext.Provider value={{ mediaURLs, setMediaURLs }}>
            {children}
        </MediaURLsContext.Provider>
    )
}



