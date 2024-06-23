import Image from "next/image"
import { useEffect } from "react"

type TPopupProps = {
    title: string
    setPopupState: (state: boolean) => void
    children: React.ReactNode
}

export default function Popup(props: TPopupProps) {
    const { title, setPopupState, children } = props
    
    useEffect(() => {
        const popupObj = document.getElementById("popup")

        const handleClickingOverlay = (e: MouseEvent) => {
            if (!(popupObj?.contains(e.target as Node))) {
                setPopupState(false)
            }
        }

        window.addEventListener("mousedown",handleClickingOverlay)
        return () => {window.removeEventListener("mousedown",handleClickingOverlay)}
    },[setPopupState])
    
    return (
        <div className="overlay-background flex items-center justify-center">
            <div id="popup" className="absolute top-1/2 left-1/2 box-border py-2 px-5 
            -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl">
                {/* header */}
                <div className="grid grid-cols-[1fr_auto] items-center border-b-2 border-b-[rgb(230,230,230)] 
                py-[6px] pt-[2px] mb-1 gap-2">
                    <div className="font-semibold">{title}</div>
                    <div className="p-2 hover:bg-[rgb(243,243,243)] rounded-full hover:cursor-pointer"
                    onClick={() => setPopupState(false)}>
                        <Image 
                            src={"/assets/x.svg"}
                            width={20}
                            height={20}
                            alt="Remove popup"
                        />
                    </div>
                </div>

                {/* buttons */}
                {children}
            </div>
        </div>
    )
}
