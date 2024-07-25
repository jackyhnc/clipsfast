"use client"
import { auth, db } from "@/config/firebase"
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore"
import { 
    GoogleAuthProvider, 
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signInWithPopup,
} from "firebase/auth"

import { createContext, useContext, useEffect, useState } from "react"

import { useRouter } from 'next/navigation'

import { useToast } from "@/components/ui/use-toast"

const AuthContext = createContext({})

type TAddUserToDB = {
    name: string, 
    email: string
}
const addUserToDB = async ({ name, email }: TAddUserToDB) => {
    type TUserObject = {
        name?: string,
        projectsIDs: Array<string>,
    }
    const userObject: TUserObject = {
        name: "",
        projectsIDs: []
    }

    await setDoc(doc(db, "users", email), userObject)
}

export const AuthContextProvider = ({children}: {children: React.ReactNode}) => {
    const router = useRouter()
    const { toast } = useToast()

    const [user, setUser] = useState<any>(undefined)

    const signup = async (formdata: FormData) => {
        const email = formdata.get("email") as string
        const password = formdata.get("password") as string
    
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email)) {
            toast({
                title: "Email isn't valid.",
                variant: "destructive",
                duration: 2000,
            })
        }
    
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
        if (!passwordRegex.test(password)) {
            toast({
                title: "Password isn't valid.",
                variant: "destructive",
                duration: 2000,
            })
        }
    
        try {
            await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
                const addUserToDBProps = {
                    name: "",
                    email: userCredential.user.email || ""
                }
                addUserToDB(addUserToDBProps)
            })
            router.push("/studio")
            
        } catch (error: any) {
            const errorMessage = error.message;
            console.error(error)      
    
            toast({
                title: errorMessage,
                variant: "destructive",
                duration: 2000,
            })
        }
    }

    const signin = async (formdata: FormData) => {
        const email = formdata.get("email") as string
        const password = formdata.get("password") as string
    
        try {
            await signInWithEmailAndPassword(auth, email, password)
            router.push("/studio")
    
        } catch (error: any) {
            const errorMessage = error.message;
            console.error(error)      
    
            toast({
                title: errorMessage,
                variant: "destructive",
                duration: 2000,
            })
        }
    }

    const googleSignin = async () => {
        try {
            const provider = new GoogleAuthProvider()
            const userCredential = await signInWithPopup(auth, provider)
            const user = userCredential.user
            
            const userDocSnapshot = await getDoc(doc(db, "users", user.email!))
            if (!userDocSnapshot.exists()) {
                const addUserToDBProps = {
                    name: "",
                    email: userCredential.user.email || ""
                }
                addUserToDB(addUserToDBProps)
            }
            router.push("/studio")
        } catch (error: any) {
            const errorMessage = error.message;
            console.error(error)      

            toast({
                title: errorMessage,
                variant: "destructive",
                duration: 2000,
            })
        }
    }

    const signout = async () => {
        try {
            await firebaseSignOut(auth)
            router.push("/")
            
        } catch (error: any) {
            const errorMessage = error.message;
            console.error(error)      
    
            toast({
                title: errorMessage,
                variant: "destructive",
                duration: 2000,
            })
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
        });
        return () => unsubscribe();
    }, [user])

    return (
        <AuthContext.Provider value={{user, signup, signin, googleSignin, signout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}
