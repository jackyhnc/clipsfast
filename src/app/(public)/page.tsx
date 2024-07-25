import { WaitlistForm } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

function CallToActionButton({ children }: { children: React.ReactNode }) {
  return (
    <Link href="/signup" className="w-fit">
      <Button className="w-52 bg-[var(--salmon-orange)] text-lg font-semibold px-4 py-6">
        {children}
      </Button>
    </Link>
  );
}
export default function Home() {
  return (
    <div className="flex flex-col bg-[var(--bg-yellow-white)] text-[var(--purple-black)] font-medium">
      <div className="w-lvw h-[800px]">
        <div className="grid grid-cols-2 items-center size-full px-10">
          <div className="mx-6 py-auto flex flex-col gap-14">
            <div className="text-[var(--purple-black)] items-center justify-center flex flex-col gap-6">
              <div className="font-extrabold text-7xl">
                Generate shorts from videos
                <span className="text-[var(--salmon-orange)] font-extrabold">
                  {" "}
                  easily & instantly
                </span>
              </div>
              <div className="text-lg">
                Extract the highlights of existing videos with ai and create
                engaging short videos. Let AI save you time and make content
                creation effortless.
              </div>
            </div>

            <div className="">
              <div className="flex flex-col gap-2 text-[#0C1844]">
                <CallToActionButton>Try it now. It's free!</CallToActionButton>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center size-full">
            <Image
              src={"/assets/home/printer-asset.png"}
              alt="printer picture asset"
              width={400}
              height={0}
              quality={100}
            />
          </div>
        </div>
      </div>

      <div className="w-lvw h-[800px]">
        <div className="grid grid-cols-2 items-center size-full px-10">
          <div className="">
            <Image
              src={"/assets/home/comparison-chart.png"}
              alt="printer picture asset"
              width={1000}
              height={0}
              quality={100}
              className="w-full"
            />
          </div>

          <div className="space-y-10 px-10">
            <div className="space-y-6">
              <div className="font-extrabold text-5xl">
                We <span className="text-[var(--salmon-orange)]">don't</span>{" "}
                inflate our prices!
              </div>
              <div className="text-lg">
                Pay for what you use. Don't let pricey services f*ck you over!
                Most services charge way too much for their AI integrated
                services, when they don't need to.
              </div>
            </div>
            <CallToActionButton>Just join bro.</CallToActionButton>
          </div>
        </div>
      </div>

      <div className="w-lvh h-[150px] bg-[var(--purple-black)] flex items-center px-10">
        <div className="flex gap-2">
          <div className="text-white flex">
            Made by
            <Link
              href={"https://www.instagram.com/j4ckyhnc/"}
              className="underline text-purple-300 flex ml-1"
            >
              <Image
                src={
                  "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                }
                alt="instagram logo"
                width={0}
                height={0}
                quality={100}
                className="w-5 h-5"
              />
              <div className="">@j4ckyhnc</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  //have a section that compares prices and features of my app to competitors
  //maybe sm like this https://www.highthrivedigital.com/wp-content/uploads/gohighlevel-price-comparison-800px-min-768x477.png
}
