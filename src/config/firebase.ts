import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
}
export const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

export const db = getFirestore(app)