"use client"

import { useState, createContext } from "react"

type TMediaURLsContextProps = {
    mediaURLs: Array<string>,
    setMediaURLs: React.Dispatch<React.SetStateAction<string[]>>,
}
const defaultContext: TMediaURLsContextProps = {
    mediaURLs: [],
    setMediaURLs: () => {},
}
export const MediaURLsContext = createContext<TMediaURLsContextProps>(defaultContext)

type TMediaURLsContextProvider = {
    children: React.ReactNode
}
export default function MediaURLsContextProvider({children}: TMediaURLsContextProvider) {
    const [mediaURLs, setMediaURLs] = useState<Array<string>>([])
    
    return (
        <MediaURLsContext.Provider value={{ mediaURLs, setMediaURLs }}>
            {children}
        </MediaURLsContext.Provider>
    )
}



