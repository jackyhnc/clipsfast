import MediaURLsContextProvider from "@/context/MediaURLsContext"

type TMainLayoutProps = {
    children: React.ReactNode
}

export default function MainLayout({ children }: TMainLayoutProps) {

    return (
        <>       
            <nav className="bg-gray-300 h-[50px] w-full fixed top-0 z-[100]">

            </nav>

            <MediaURLsContextProvider>
                {children}
            </MediaURLsContextProvider>
        </>
    )
}
