"use client"
import { createContext, useContext, useState } from "react"

const AuthContext = createContext({})

export const AuthContextProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState(undefined)

    return (
        <AuthContext.Provider value={{user}}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}