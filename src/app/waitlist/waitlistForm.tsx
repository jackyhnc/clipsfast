"use client"
import { updateWaitlist } from "@/actions/updateWaitlist"
import { useState } from "react"

export function WaitlistForm() {
    const [outputMsg, setOutputMsg] = useState("")
    const [outputMsgColor, setOutputMsgColor] = useState("black")

    const handleFormSubmit = async (e: any) => {
        e.preventDefault()
        const email = ((e.target as HTMLFormElement).elements.namedItem("email") as HTMLInputElement).value
        const successObject = await updateWaitlist(email)

        setOutputMsg(successObject.message)
        if (successObject.success) {
            setOutputMsgColor("green")
        } else {
            setOutputMsgColor("red")
        }
    }

    return (
        <div className="flex flex-col justify-center gap-2 relative">
            <form className="flex h-12" onSubmit={(e) => handleFormSubmit(e)}>
                <input
                    name="email"
                    className="h-full pl-3 border-0 rounded-l-lg w-[80%]"
                    placeholder="email"
                    onChange={() => setOutputMsg("")}
                />
                <button className="h-full bg-[#FF6969] text-white font-medium px-8 rounded-r-lg">Join</button>
            </form>
            <div style={{color:outputMsgColor}} className="absolute bottom-0 translate-y-[120%]">{outputMsg}</div>
        </div>
    )
  }