"use client";

import { useEffect, useState } from "react";
import { TProject } from "../../types";

import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

import { useProjectsContext } from "@/context/ProjectsContext";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";

type TStudioProjectProps = {
  params: { id: string };
  children: React.ReactNode;
};
export default function StudioProjectLayout({
  params,
  children,
}: TStudioProjectProps) {
  const { setProject, project, setFetchingProjectState } = useProjectsContext() as {
    setProject: React.Dispatch<React.SetStateAction<TProject>>,
    setFetchingProjectState: React.Dispatch<React.SetStateAction<boolean>>,
    project: TProject,
  };
  const { user } = UserAuth() as { user: any };

  const router = useRouter()

  useEffect(() => {
    async function checkIfUserIsProjectOwner() {
      const userDocRef = doc(db, "users", user.email);
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        return
      }

      const userDocData = userDoc.data()
      if (!userDocData.projectsIDs.includes(params.id)) {
        router.push("/studio")
        throw new Error("You are not the owner of this project.")
      }
    }
    checkIfUserIsProjectOwner()

    const projectDocRef = doc(db, "projects", params.id);
    const unsubscribe = onSnapshot(projectDocRef, (projectDocSnap) => {
      if (projectDocSnap.exists()) {
        setProject(projectDocSnap.data() as TProject);
      } else {
        console.error(`Project ${params.id} cannot be fetched.`);
        router.push("/studio");
      }
      setFetchingProjectState(false);
    });
    return () => unsubscribe();
  }, [params.id, router, setFetchingProjectState, setProject]);

  /*

  const [editedVideoDisplayCanvas, setEditedVideoDisplayCanvas] =
    useState<fabric.Canvas>();
  function EditedVideoOutputDisplay({ className }: { className?: string }) {
    useEffect(() => {
      const editedVideoDisplay = new fabric.Canvas("editedVideoDisplayCanvas", {
        isDrawingMode: true,
        selection: true,
        hoverCursor: "pointer",
      });

      setEditedVideoDisplayCanvas(editedVideoDisplayCanvas);

      var rect = new fabric.Rect({
        left: 100,
        top: 50,
        width: 100,
        height: 100,
        fill: "green",
        angle: 20,
        padding: 10,
      });
      editedVideoDisplay.add(rect);

      return () => {
        editedVideoDisplay.dispose();
      };
    }, []);

    return <canvas className={className} id="editedVideoDisplayCanvas" />;
  }
  console.log(1);

  const addRect = () => {
    const rect = new fabric.Rect({
      height: 280,
      width: 200,
      stroke: "#2BEBC8",
      isDrawingMode: true,
    });
    editedVideoDisplayCanvas?.add(rect);
    editedVideoDisplayCanvas?.requestRenderAll();
  };

  addRect();

  */

  return (
    <div className="">{children}</div>
  );
}
