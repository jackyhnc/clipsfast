"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { db } from "@/config/firebase";
import { doc, onSnapshot, query, where, getDocs, collection } from "firebase/firestore";

import { UserAuth } from "@/context/AuthContext";

import { TProject } from "./types";
import { addProject } from "@/actions/addProject";
import { deleteProject } from "@/actions/deleteProject";

export default function StudioDashboard() {
  const { user } = UserAuth() as { user: any };

  const router = useRouter();

  const [projects, setProjects] = useState<Array<TProject>>([]);

  //updates projects state on db side changes
  const [fetchingProjectsState, setFetchingProjectsState] = useState(true);
  useEffect(() => {
    const userDocRef = doc(db, "users", user.email);
    const projectsRef = collection(db, "projects");

    const unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
      setFetchingProjectsState(false);
      const projectIDs: Array<string> = snapshot.data()?.projectsIDs ?? [];

      if (!projectIDs.length) {
        setProjects([]);
        return;
      }

      const fetchedProjectsQuery = query(projectsRef, where("projectID", "in", projectIDs));
      const fetchedProjectsSnapshot = await getDocs(fetchedProjectsQuery);
      const fetchedProjects: TProject[] = fetchedProjectsSnapshot.docs.map((doc) => doc.data() as TProject);

      const sanitizedFetchedProjects = fetchedProjects.filter((project) => project !== undefined);
      const sortedFetchedProjects = sanitizedFetchedProjects.sort((a, b) => b.dateCreatedTimestamp - a.dateCreatedTimestamp);
      setProjects(sortedFetchedProjects);
    });
    return () => unsubscribe();
  }, [user.email]);

  function AddProjectsButton() {
    const [createProjectFormErrorMsg, setCreateProjectFormErrorMsg] = useState("");

    const [createProjectButtonPressed, setCreateProjectButtonPressed] = useState(false);
    const handleCreateProjectFormSubmit = async (e: any) => {
      e.preventDefault();
      if (createProjectButtonPressed) {
        return;
      }

      const projectNameInput = e.currentTarget.elements.projectName as HTMLInputElement;
      const mediaURLInput = e.currentTarget.elements.url as HTMLInputElement;

      const projectName = projectNameInput.value;
      const mediaURL = mediaURLInput.value;

      try {
        setCreateProjectButtonPressed(true);
        const { projectID } = await addProject({ projectName, mediaURL, userEmail: user.email });
        router.push(`/studio/project/${projectID}`);
      } catch (error: any) {
        console.error(error);
        setCreateProjectFormErrorMsg(error.message);
        setCreateProjectButtonPressed(false);
      }
    };

    return (
      <Dialog>
        <DialogTrigger>
          <Button className="p-3 bg-[var(--salmon-orange)]">
            <i className="fa-solid fa-plus text-lg"></i>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Ready to pump out viral shorts fast?</DialogTitle>
            <DialogDescription>Create a new project</DialogDescription>
          </DialogHeader>
          <div className="">
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => handleCreateProjectFormSubmit(e)}
              onChange={() => setCreateProjectFormErrorMsg("")}
            >
              <div className="flex flex-col space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url">Project Name</Label>
                  <Input name="projectName" id="projectName" placeholder="Untitled" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">* Input the video URL you want to use.</Label>
                  <Input name="url" id="url" placeholder="URL" required />
                </div>

                <div className="space-y-2 flex flex-col">
                  {createProjectButtonPressed ? (
                    <div
                      className="flex flex-row items-center gap-2 justify-center w-full border-2 rounded-md 
                    border-[var(--salmon-orange)] h-10 px-4 py-2"
                    >
                      <span>Creating project...</span>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                    </div>
                  ) : (
                    <Button type="submit" name="submit" className="bg-[var(--salmon-orange)]">
                      Create Project
                    </Button>
                  )}
                  <Label className="">
                    <div className="text-red-500 text-ellipsis break-all">{createProjectFormErrorMsg}</div>
                  </Label>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  function ProjectsCards() {
    const selectProject = (projectID: string) => {
      /*
      const selectedProject = projects.find(project => project.projectID === projectID)
      if (!selectedProject) {
        throw new Error("Project not found.")
      }
      
      setProject(selectedProject as TProject)
      */
      router.push(`/studio/project/${projectID}/clips`);
    };

    return (
      <div className="bg-[var(--bg-white)] border-2 rounded-lg p-8 flex">
        <div className="gap-x-7 gap-y-10 flex flex-wrap">
          {fetchingProjectsState && (
            <div className="text-[var(--slight-gray)] w-full self-center justify-self-center">
              Loading your video projects...
            </div>
          )}
          {!projects.length && !fetchingProjectsState && (
            <div className="text-[var(--slight-gray)] justify-self-center">No projects to display.</div>
          )}
          {projects.map((project) => {
            const projectDateObject = new Date(project.dateCreated);
            const projectDate = projectDateObject.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            });

            return (
              <div className="relative group/card z-20" key={project.projectID}>
                <div
                  className="bg-[var(--bg-white)] w-fit p-2 rounded-md hover:shadow-xl hover:scale-[1.01] 
                  transition fade-in-5 border-2 relative cursor-pointer"
                  onClick={() => selectProject(project.projectID)}
                >
                  <TooltipProvider delayDuration={500}>
                    <Tooltip>
                      <TooltipTrigger>
                        <div>
                          {project.thumbnail ? (
                            <Image
                              src={project.thumbnail}
                              alt="project thumbnail"
                              width={200}
                              height={0}
                              className="h-auto rounded-sm aspect-[16/9] object-cover cursor-pointer"
                            />
                          ) : (
                            <div className="rounded-sm w-[200px] bg-[var(--light-gray)] aspect-[16/9] flex">
                              <i className="fa-solid fa-video text-5xl m-auto text-[var(--bg-white)]" />
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{project.media.url}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="my-1 w-[200px] space-y-2">
                    <div className="font-medium line-clamp-2 text-sm h-[40px]">
                      {project.name ?? "Untitled"}
                    </div>
                    <div className="text-xs text-[var(--slight-gray)]">
                      Date Created: {projectDate ?? "No Date Created"}
                    </div>
                  </div>
                </div>
                <div className="absolute top-1 right-1">
                  <Dialog>
                    <DialogTrigger className="">
                      <div
                        className="group-hover/card:opacity-100 opacity-0
                      rounded-full hover:bg-[var(--muted-gray)] bg-[var(--bg-white)] border-2 
                      flex transition fade-in p-1 z-10"
                      >
                        <Image src={"/assets/x.svg"} alt="delete project" width={20} height={20} />
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. <br />
                          Project ID: {project.projectID}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex w-full justify-center">
                        <Button
                          type="submit"
                          variant="destructive"
                          onClick={() =>
                            deleteProject({ projectID: project.projectID, userEmail: user.email })
                          }
                        >
                          Delete Project
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-[var(--bg-white)] min-h-lvh">
      <div className="space-y-6">
        <div className="flex gap-3 items-center">
          <div className="font-semibold text-2xl">Projects</div>
          <div>
            <AddProjectsButton />
          </div>
        </div>

        <div className="">
          <ProjectsCards />
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
