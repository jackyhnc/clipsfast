
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, getDocs } from "firebase/firestore"; 

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
    //upload emial to firebase, if duplicates, send back

    const existingDocs = await getDocs(collection(db, "clipsfast/waitlistEmails"));

    const isDuplicates = Object.keys(existingDocs).some((doc) => {
        doc === email
    });

    if (isDuplicates) {
        return "This email has already been added."
    } else {
        addDoc((collection(db, "clipsfast/waitlistEmails")), { email: email })
        return "Success"
    }
}