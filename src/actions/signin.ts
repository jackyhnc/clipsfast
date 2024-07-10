"use server"

import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithRedirect } from "firebase/auth";
import { auth } from "@/config/firebase";

export async function signin(formdata: FormData) {
    const email = formdata.get("email") as string
    const password = formdata.get("password") as string

    try {
        await signInWithEmailAndPassword(auth, email, password)

        return { success: true, message: "Sucessfully signed in!" }

    } catch (error: any) {
        const errorMessage = error.message;
        const errorCode = error.code;  
        console.error(error)      

        return { success: false, message: errorMessage, errorCode: errorCode }
    }
}

export async function goasdfogleSignin() {
    try {
        const provider = new GoogleAuthProvider()
        await signInWithRedirect(auth, provider)

        return { success: true, message: "Sucessfully signed in!" }

    } catch (error: any) {
        const errorMessage = error.message;
        const errorCode = error.code;  
        console.error(error)      

        return { success: false, message: errorMessage, errorCode: errorCode }
    }
}