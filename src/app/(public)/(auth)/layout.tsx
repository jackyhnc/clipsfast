"use client"

import { auth } from "@/config/firebase";
import { UserAuth } from "@/context/AuthContext";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function AuthPagesLayout({children}: {children: React.ReactNode}) {
    const { user } = UserAuth() as { user: any };
    const router = useRouter()

    useEffect(() => {
        const checkAuth = () => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    router.push("/studio")
                }
            });
        };
        checkAuth();
    }, [router]);

    return (
        <div className="w-full h-screen bg-blue bg-[var(--bg-yellow-white)]">
            <div className="flex flex-col items-center justify-center h-full relative">
                <div className="z-10">
                    {children}
                </div>
                <Image
                    src={"/assets/auth/gradient.png"}
                    alt="gradient asset"
                    width={0}
                    height={0}
                    quality={100}
                    className="w-1/2 h-auto absolute z-0 select-none"
                    draggable={false}
                />
            </div>
        </div>
    )
}