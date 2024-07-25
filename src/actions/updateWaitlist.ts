"use server"

import { db } from "@/config/firebase";
import { arrayUnion, getDoc, getFirestore, updateDoc, doc } from "firebase/firestore";


export const updateWaitlist = async (email: string) => {

    const emailVerficationRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const isEmailValid = emailVerficationRegex.test(email)
    if (!isEmailValid) {
        return { success: false, message: "Email isn't valid" }
    }

    const waitlistEmailsRef = doc(db, "clipsfast", "waitlistEmails")

    const docSnapshot = await getDoc(waitlistEmailsRef)

    if (docSnapshot.exists()) {
        const existingEmails = docSnapshot.data().emails

        const isEmailAlreadyAdded = existingEmails.some((existingEmail: string) => existingEmail === email)

        if (isEmailAlreadyAdded) {
            return { success: false, message: "Email already added." }
        } else {
            updateDoc(waitlistEmailsRef, {
                emails: arrayUnion(email)
            })
            return { success: true, message: "Sucessfully added!"}
        }

    } else {
        return { success: false, message: "Waitlist emails database doesn't exist."}
    }
}