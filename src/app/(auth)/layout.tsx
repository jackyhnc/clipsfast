


export default function AuthPagesLayout({children}: {children: React.ReactNode}) {

    return (
        <div className="w-full h-screen bg-blue grid grid-cols-2 bg-[var(--yellow-white)]">
            <div className="bg-gradient-to-tl from-[#89f7fe] to-[#66a6ff]"></div>
            <div className="bg-[--primary-bgcolor] flex items-center justify-center">
                {children}
            </div>
        </div>
    )
}