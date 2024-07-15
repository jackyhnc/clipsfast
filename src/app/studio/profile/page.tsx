import { UserAuth } from "@/context/AuthContext"

export default function ProfilePage() {
    const { user } = UserAuth()
    return (
        <div className="min-h-lvh bg-[var(--bg-yellow-white)] ">
            <div className="text-9xl">{user}</div> 
        </div>
    )
}   