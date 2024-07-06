"use server"

import auth from "@/config/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"

export async function signup(formdata: FormData) {
    const email = formdata.get("email") as string
    const password = formdata.get("password") as string

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
        return { success: false, message: "Email isn't valid." }
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    if (!passwordRegex.test(password)) {
        return { success: false, message: "Password isn't valid." }
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password)
        return { success: true, message: "Welcome!" }
    } catch (error: any) {
        const errorMessage = error.message;
        const errorCode = error.code;
        console.log(errorMessage, errorCode)

        return { success: false, message: errorMessage }
    }
}
