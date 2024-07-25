"use client"

import { UserAuth } from "@/context/AuthContext"

export default function ProfilePage() {
    const { user } = UserAuth() as { user: any };
    
    return (
        <div className="min-h-lvh bg-[var(--bg-white)]">
            <div className="text-9xl">{user.email}</div> 
        </div>
    )
}   