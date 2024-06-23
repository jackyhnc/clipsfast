"use client"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation";

export default function TanstackProvider({children}: {children: React.ReactNode}) {
    const queryClient = new QueryClient()

    const router = useRouter();
    if (usePathname() !== '/waitlist') {
        router.push('/waitlist')
        throw Error("Only waitlist page is available at the moment.")
        console.log("Only waitlist page is available at the moment.")
    }

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}