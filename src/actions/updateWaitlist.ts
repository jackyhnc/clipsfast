"use server"

import { initializeApp } from "firebase/app";
import { arrayUnion, getDoc, getFirestore, updateDoc, doc } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object

const firebaseConfig = {
  apiKey: "AIzaSyCF-FJaQAgpG11QybqRNa_IcujvsEEUVoE",
  authDomain: "clipsfast-fedd3.firebaseapp.com",
  projectId: "clipsfast-fedd3",
  storageBucket: "clipsfast-fedd3.appspot.com",
  messagingSenderId: "202399973457",
  appId: "1:202399973457:web:760c200b2797c5395fb870",
  measurementId: "G-E6HJ43CXEG",
  databaseURL: "https://clipsfast.firebaseio.com"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

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