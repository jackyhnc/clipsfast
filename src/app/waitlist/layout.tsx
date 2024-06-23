import Image from "next/image";

export default function WaitlistLayout({children}: {children: React.ReactNode}) {
  function Navbar() {
    return (
      <nav className="flex justify-left h-16 items-center px-12 bg-[#FFF5E1] z-50">
        <div className="">
          <Image
            src={"assets/waitlist/logo.svg"}
            alt="logo"
            width="0"
            height="0"
            className="w-28 h-auto"
          />
        </div>
      </nav>
    )
  }

  function Footer() {
    return (
        <div className="bg-[#0C1844] w-full text-white p-16 flex gap-1">
            made by 
            <a 
                href="https://www.instagram.com/j4ckyhnc?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                className="underline text-purple-300"
            >
                @j4ckyhnc
            </a>
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                className="w-5"
            />
        </div>
    )
  }
  
  return (
    <div className="" style={{background:"#FFF5E1"}}>
        <Navbar />
        {children}
        <Footer />
    </div>
  );
}
