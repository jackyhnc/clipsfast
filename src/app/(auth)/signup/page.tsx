"use client"

import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

import { signup } from "@/actions/signup"

import { useEffect, useState } from "react"


export default function SignUpCard() {
    type TSignupResponse = {
        success: boolean | undefined,
        message: string,
    }
    const defaultSignupError: TSignupResponse = {
        success: undefined,
        message: "",
    }

    const { toast } = useToast()
    const handleFormSubmit = async (e: any) => {
        e.preventDefault()

        const formData = new FormData(e.target)
        const newSignupResponse = await signup(formData)

        if (!newSignupResponse.success) {
            console.log('toast')
            toast({
                title: newSignupResponse.message,
                variant: "destructive",
                duration: 2000,
            })
        }
    }

    return (
        <div className="bg-[var(--primary-bgcolor)]">
            <CardHeader>
                <div className="mx-4 flex flex-col items-center gap-3">
                    <CardTitle>Register an account</CardTitle>
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
                        <Input
                            name="password"
                            id="password"
                            placeholder="Password"
                        />
                        <Button type="submit" name="submit">
                            Continue
                        </Button>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                    <Button variant="outline" className="bg-white border-muted-foreground">
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
            </CardContent>
        </div>
    )
}