import Image from "next/image";
import { WaitlistForm } from "./waitlistForm";

export default function Home() {
  
  return (
    <main className="">
      <div className="grid grid-cols-2 m-10 items-center">

        <div className="mx-6 my-20 flex flex-col gap-20">
          <div className="text-[#0C1844] items-center justify-center flex flex-col gap-6">
            <div className="font-extrabold text-7xl">Generate shorts from videos <span className="text-[#FF6969] font-extrabold text-7xl">easily & instantly</span></div>
            <div className="text-xl">Extract the highlights of existing videos with ai and create engaging short videos. Let AI save you time and make content creation effortless.</div>
          </div>
          
          <div className="">
            <div className="flex flex-col gap-2 text-xl text-[#0C1844]">
                <div className="font-medium">Join the waitlist!</div>
                <WaitlistForm />
            </div>
          </div>
        </div>

        <div className="mx-20 text-[#C80036] h-[600px] overflow-y-clip flex flex-col gap-2">
            <div className="animate-infinite-scroll">
                <div className="font-extrabold text-8xl text-center">
                    Offering Compettive Pricing For AI Services
                </div>
                <div className="text-[#FF6969] font-extrabold text-8xl text-center">
                    Faster Video Processing Than Other Products
                </div>
                <div className="font-extrabold text-8xl text-center">
                    A Beautiful UI Interface To Work With
                </div>
                <div className="text-[#FF6969] font-extrabold text-8xl text-center">
                    Attentive Customer Support
                </div>
            </div>

            <div className="animate-infinite-scroll">
                <div className="font-extrabold text-8xl text-center">
                    Offering Compettive Pricing For AI Services
                </div>
                <div className="text-[#FF6969] font-extrabold text-8xl text-center">
                    Faster Video Processing Than Other Products
                </div>
                <div className="font-extrabold text-8xl text-center">
                    A Beautiful UI Interface To Work With
                </div>
                <div className="text-[#FF6969] font-extrabold text-8xl text-center">
                    Attentive Customer Support
                </div>
            </div>
        </div>
      </div>

    </main>
  );
}
