"use client"


import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import { auth, db } from "@/config/firebase";

import { useRouter } from "next/router";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, serverTimestamp } from "firebase/firestore";

//firebase types
import { FieldValue } from "firebase/firestore";  

export default function StudioDashboard() {
    type TProject = {
        dateCreated: FieldValue,
        mediaURL: string,
        name: string,
        ownerEmail: string,
    }
    const [projects, setProjects] = useState<Array<TProject>>([]);

    const router = useRouter();

    const createProject = async () => {
        const newProjectRef = await addDoc(collection(db, 'projects'), {
            dateCreated: serverTimestamp(),
            mediaURL: '',
            name: '',
            ownerEmail: auth.currentUser?.email || '',
        });
        router.push(`/studio/projects/${newProjectRef.id}`);
    };

    useEffect(() => {
        const unsubscribeSnapshotListener = onSnapshot(doc(db, 'users', auth.currentUser?.email || ''), (userDoc) => {
            const projects = userDoc.data()?.projects || [];
            const fetchedProjectsPromise = Promise.all(projects.map(async (projectId: string) => {
                const projectDoc = await getDoc(doc(db, 'projects', projectId));
                const projectData = projectDoc.data()
                return {
                    dateCreate: projectData?.dateCreated,
                    mediaURL: projectData?.mediaURL,
                    name: projectData?.name,
                    ownerEmail: projectData?.ownerEmail,
                };
            }));

            fetchedProjectsPromise.then((fetchedProjects) => {
                setProjects(fetchedProjects);
            })
        })
        
        return () => unsubscribeSnapshotListener();
    }, []);

    const coolList = Array.from({length: 50})
    return (
        <div className="px-10 pt-14 pb-40 bg-[var(--bg-yellow-white)]">
            <div className="space-y-6">
                <div className="flex gap-4 items-center">
                    <div className="font-semibold text-2xl">Projects</div>
                    <Button className="p-3 text-2xl bg-[var(--purple-black)]">
                        <i className="fa-solid fa-plus"></i>
                    </Button>
                </div>

                <div className="">
                    <div className="flex flex-wrap gap-6 pt-12 bg-[var(--bg-white)] p-4 border-2 rounded-lg items-center justify-center">
                        {coolList.map(() => {
                            return (
                                <div className="bg-[var(--bg-white)] w-fit p-2 shadow-lg rounded-md hover:shadow-2xl transition fade-in-5 cursor-pointer border">
                                    <Image
                                        src="https://i.ytimg.com/vi/4k7IdSLxh6w/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDNwbR7rkR1NLfTCTZmhTuTlAarlQ"
                                        alt="project thumbnail"
                                        width={250}
                                        height={0}
                                        className="h-auto rounded-sm"
                                    />
                                    <div className="my-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                        <div className="font-medium">{"project"?? "No Name"}</div>
                                        <div className="text-xs text-[var(--slight-gray)]">
                                            <div className="">Date Created: {"date created"?? "No Date Created"}</div>

                                        </div>
                                    </div>

                                </div>
                            )
                        })}
                    </div>

                </div>

            </div>
        </div>
    )
}


/*
export default function MainApp() {
    const [videoURL, setVideoURL] = useState<Array<string>>([])
    const [videoPaths, setVideoPaths] = useState<Array<string>>([])

    const fetchTranscript = async (videoURL: string) => {
        try {
            const response = await fetch(`/api/autohighlights`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        videoURL: videoURL
                    }
                )
            })

            const fetchedVideoPaths = await response.json()
            setVideoPaths(fetchedVideoPaths)
            console.log(fetchedVideoPaths)
        } catch(error) {
            console.error(error)
        }
    }

    const handleUploadComplete = (res: { url: string }[]) => {
        const uploadedUrls = res.map(video => {
            return video.url
        })
        setVideoURL(uploadedUrls)



    }

    return (
        <main className="mx-8 flex flex-col items-center">
            <ImageUpload onUploadComplete={handleUploadComplete} />

            <div className="flex flex-wrap justify-center gap-12">
                <div className="h-[250px] flex">
                    <VideoPlayer url={"https://jackkhc.github.io/hostingThings/clipsfast/Rarest%20Pineapple%20World.mp4"}/>
                </div>

                
                {videoPaths.map((path: string) => {
                    return (
                        <div className="w-10" key={path}>
                            <VideoPlayer url={"https://jackkhc.github.io/hostingThings/clipsfast/Rarest%20Pineapple%20World.mp4"}/>
                        </div>
                    )
                })}
            </div>



        </main>
    )
}
*/
