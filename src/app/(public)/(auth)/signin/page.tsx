"use client"

import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import Image from "next/image"

import { useState } from "react"
import Link from "next/link"

import { UserAuth } from "@/context/AuthContext"

export default function SigninCard() {
    const { signin, googleSignin } = UserAuth()

    const handleFormSubmit = async (e: any) => {
        e.preventDefault()

        const formData = new FormData(e.target)
        await signin(formData)
    }

    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="bg-[var(--primary-bgcolor)]">
            <CardHeader>
                <div className="mx-4 flex flex-col items-center gap-3">
                    <CardTitle>Sign Into Your Account</CardTitle>
                    <CardDescription>Enter your email to sign in to your account</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form className="flex flex-col gap-4" onSubmit={(e) => handleFormSubmit(e)}>
                    <div className="flex flex-col gap-2">
                        <Input
                            name="email"
                            id="email"
                            placeholder="Email"
                        />
                        <div className="relative">
                            <Input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Password"
                            />
                            <Button
                                variant="ghost"
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 size-fit rounded-full"
                            >
                                <Image
                                    src={showPassword ? "assets/auth/lock-open.svg" : "assets/auth/lock-closed.svg"}
                                    alt="show password icon"
                                    width={0}
                                    height={0}
                                    className="w-4 h-4"
                                />
                            </Button>
                        </div>
                        <Button type="submit" name="submit">
                            Continue
                        </Button>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                    <Button 
                        variant="outline" 
                        className="bg-white border-muted-gray" 
                        type="button"
                        onClick={() => googleSignin()}
                    >
                        <div className="flex gap-3">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1920px-Google_%22G%22_logo.svg.png?20230822192911" 
                                alt="Google Logo" 
                                className="size-5"
                            />
                            <div className="">Google</div>
                        </div>
                    </Button>
                    
                </form>
                <Link 
                    className="relative flex justify-center text-sm text-muted-foreground hover:underline m-auto mt-6"
                    href="/signup"
                >
                    Don't have an account? Register one here.
                </Link>
            </CardContent>
        </div>
    )
}
