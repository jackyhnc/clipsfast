import { WaitlistForm } from "@/components/WaitlistForm";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col bg-[var(--yellow-white)] font-medium">

            <div className="w-lvw h-[800px]">
                <div className="grid grid-cols-2 items-center size-full px-10">
                    <div className="mx-6 py-auto flex flex-col gap-20">
                        <div className="text-[var(--purple-black)] items-center justify-center flex flex-col gap-6">
                        <div className="font-extrabold text-7xl">Generate shorts from videos 
                            <span className="text-[#FF6969] font-extrabold"> easily & instantly</span>
                        </div>
                        <div className="text-lg">Extract the highlights of existing videos with ai and create engaging short videos. Let AI save you time and make content creation effortless.</div>
                        </div>
                        
                        <div className="">
                        <div className="flex flex-col gap-2 text-[#0C1844]">
                            <div className="">
                            <div className="">Join the waitlist!</div>
                            <div className="text-gray-500">No spam. Will shoot u an email when the product is done 👍</div>
                            </div>
                            <WaitlistForm />
                        </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center size-full">
                        <Image 
                            src={"/assets/home/printer-asset.png"}
                            alt="printer picture asset"
                            width={500}
                            height={0}
                            quality={100}
                        /> 
                    </div>
                </div>

            </div>

            <div className="w-lvw h-[800px] bg-black">
                
            </div>

            <div className="w-lvh h-[150px] bg-[var(--purple-black)] flex items-center px-10">
                <div className="flex gap-2">
                    <div className="text-white">
                        Made by <Link href={"https://www.instagram.com/j4ckyhnc/"}>@j4ckyhnc</Link>
                        <a></a>
                    </div>
                </div>
            </div>
        </div>


    )

    //have a section that compares prices and features of my app to competitors
    //maybe sm like this https://www.highthrivedigital.com/wp-content/uploads/gohighlevel-price-comparison-800px-min-768x477.png
}
