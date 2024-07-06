"use server"

import { signInWithEmailAndPassword } from "firebase/auth";
import auth from "@/config/firebase";

export async function signin(formdata: FormData) {
    const email = formdata.get("email") as string
    const password = formdata.get("password") as string

    try {
        await signInWithEmailAndPassword(auth, email, password)

    } catch (error: any) {
        const errorMessage = error.message;
        const errorCode = error.code;
        console.log(errorMessage, errorCode)
    }
}