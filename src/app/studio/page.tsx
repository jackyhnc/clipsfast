"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { db } from "@/config/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

import { UserAuth } from "@/context/AuthContext";
import chalk from "chalk";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StudioDashboard() {
  const { user } = UserAuth();
  const router = useRouter();

  type TProject = {
    ownerEmail: string;
    projectID: string;
    dateCreated: Date;

    mediaURL: string;
    name: string;
    thumbnail: string;
  };
  const [projects, setProjects] = useState<Array<TProject>>([]);
  useEffect(() => {
    const newProject: TProject = {
      dateCreated: new Date(),
      mediaURL: "asdfasd.com/video",
      name: "project",
      ownerEmail: "asdf@gmail.com" || "",
      thumbnail: "https://i.ytimg.com/vi/VKR8_4rqJ3I/hq720.jpg",
      projectID: "",
    };

    setProjects([newProject]);
  }, []);

  //updates projects state on db side changes
  console.log("user", user);
  useEffect(() => {
    const userDocRef = doc(db, "users", user?.email);
    const unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
      const projectIDs: Array<string> = snapshot.data()?.projectsIDs ?? [];

      const fetchedProjectsPromises = projectIDs.map(
        async (projectID: string) => {
          const projectDoc = await getDoc(doc(db, "projects", projectID));
          const projectData = projectDoc.data();

          return {
            dateCreated: projectData?.dateCreated,
            mediaURL: projectData?.mediaURL,
            name: projectData?.name,
            ownerEmail: projectData?.ownerEmail,
            thumbnail: projectData?.thumbnail,
            projectID: projectData?.projectID,
          };
        }
      );

      const fetchedProjects = await Promise.all(fetchedProjectsPromises);
      setProjects(fetchedProjects);
    });

    return () => unsubscribe();
  }, [user?.email, db]);

  const createProject = async (projectName = "Untitled", mediaURL = "") => {
    const newProject: TProject = {
      ownerEmail: user?.email || "",
      dateCreated: new Date(),
      projectID: "",

      mediaURL: mediaURL,
      name: projectName,
      thumbnail: "",
    };
    const newProjectRef = await addDoc(collection(db, "projects"), newProject);
    if (!newProjectRef) {
      throw new Error("Failed to create project");
    }

    try {
      await updateDoc(newProjectRef, {
        projectID: newProjectRef.id,
      });

      const userDocRef = doc(db, "users", user?.email || "");
      const userDocSnapshot = await getDoc(userDocRef);
      const userDocData = userDocSnapshot.data();
      const updatedProjectsIDs = [
        ...userDocData?.projectsIDs,
        newProjectRef.id,
      ];
      const updatedUserDoc = {
        ...userDocData,
        projectsIDs: updatedProjectsIDs,
      };
      await updateDoc(userDocRef, updatedUserDoc);

      toast({
        title: "Project created.",
        description: `Project ID: ${newProjectRef.id}`,
        duration: 2000,
      });

      router.push(`/studio/${newProjectRef.id}`);
    } catch (error) {
      await deleteDoc(newProjectRef);
      console.error(error);
      throw error;
    }
  };
  const [buttonPressed, setButtonPressed] = useState(false);
  function AddProjectsButton() {
        const handleCreateProjectFormSubmit = (event: any) => {
            event.preventDefault();

            const projectName = event.target.elements.projectName.value;
            const mediaURL = event.target.elements.url.value

            //check if link to url is valid, if not put error

            createProject(projectName, mediaURL);
        }

    return (
      <Dialog>
        <DialogTrigger>
          <Button className="p-3 bg-[var(--salmon-orange)]" onClick={() => setButtonPressed(true)}>
            <i className="fa-solid fa-plus text-lg"></i>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Ready to pump out viral shorts fast?</DialogTitle>
            <DialogDescription>yes</DialogDescription>
          </DialogHeader>
          <div className="">
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => handleCreateProjectFormSubmit(e)}
            >
              <div className="flex flex-col space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="url">Project Name</Label>
                    <Input
                    name="project name"
                    id="name"
                    placeholder="Untitled"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="url">Input the video URL you want to use.</Label>
                    <Input
                        name="url"
                        id="url"
                        placeholder="URL"
                        required
                    />
                </div>
                <Button type="submit" name="submit" className="bg-[var(--salmon-orange)]">
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="px-10 pt-14 pb-40 bg-[var(--bg-white)] min-h-lvh">
      <div className="space-y-6">
        <div className="flex gap-3 items-center">
          <div className="font-semibold text-2xl">Projects</div>
          <div>
            <AddProjectsButton />
          </div>
        </div>

        <div className="">
          <div className="flex flex-wrap gap-6 p-4 bg-[var(--bg-white)] border-2 rounded-lg items-center justify-center">
            {projects.map((project) => {
              const projectDate = `${project.dateCreated.getMonth()}/${project.dateCreated.getDay()}/${project.dateCreated.getFullYear()}`;
              return (
                <div
                  key={project.name}
                  className="bg-[var(--bg-white)] w-fit p-2 shadow-lg rounded-md 
                                    hover:shadow-2xl transition fade-in-5 cursor-pointer border"
                  onClick={() => router.push(`/${project.projectID}`)}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Image
                          src={project.thumbnail}
                          alt="project thumbnail"
                          width={200}
                          height={0}
                          className="h-auto rounded-sm"
                          style={{ width: "auto", height: "auto" }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>{project.mediaURL}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="my-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    <div className="font-medium">
                      {project.name ?? "Untitled"}
                    </div>
                    <div className="text-xs text-[var(--slight-gray)]">
                      <div className="">
                        Date Created: {projectDate ?? "No Date Created"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
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
