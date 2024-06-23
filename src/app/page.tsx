import Image from "next/image";
import { updateWaitlist } from "@/actions/updateWaitlist";

export default function Home() {
  const handleFormSubmit = async (e: any) => {
    e.preventDefault()
    await updateWaitlist(((e.target as HTMLFormElement).elements.namedItem("email") as HTMLInputElement).value)
  }
  return (
    <main className="">
      <div className="grid grid-cols-2 m-10 items-center">

        <div className="m-6 flex flex-col gap-14">
          <div className="text-[#0C1844] items-center justify-center flex flex-col gap-6">
            <div className="font-extrabold text-7xl">Generate shorts from videos <span className="text-[#FF6969] font-extrabold text-7xl">easily & instantly</span></div>
            <div className="text-xl">Extract the highlights of existing videos with ai and create engaging short videos. Let AI save you time and make content creation effortless.</div>
          </div>
          
          <div className="">
            <div className="flex flex-col gap-2 text-xl text-[#0C1844]">
              <div className="font-medium">Join the waitlist!</div>
              <form className="flex h-12" 
                onSubmit={async (e) => {handleFormSubmit(e)}
              }>
                <input
                  name="email"
                  className="h-full pl-3 border-0 rounded-l-lg w-full"
                  placeholder="email"
                />
                <button className="h-full bg-[#FF6969] text-white font-medium px-6 rounded-r-lg">Join</button>
              </form>
            </div>
          </div>
        </div>

        <div className="">

        </div>
      </div>

    </main>
  );
}
