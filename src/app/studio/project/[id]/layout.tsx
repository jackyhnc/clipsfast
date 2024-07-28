"use client";

import { useEffect, useState } from "react";
import { TProject } from "../../types";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

import { useProjectsContext } from "@/context/ProjectsContext";

type TStudioProjectProps = {
  params: { id: string };
  children: React.ReactNode;
};
export default function StudioProjectLayout({
  params,
  children,
}: TStudioProjectProps) {
  const { setProject, setFetchingProjectState } = useProjectsContext() as {
    setProject: React.Dispatch<React.SetStateAction<TProject>>,
    setFetchingProjectState: React.Dispatch<React.SetStateAction<boolean>>,
  };

  useEffect(() => {
    const fetchProject = async () => {
      const projectDocRef = doc(db, "projects", params.id);
      try {
        const projectDocSnap = await getDoc(projectDocRef);
        
        if (projectDocSnap.exists()) {
          setProject(projectDocSnap.data() as TProject);
        } else {
          console.log(`Project ${params.id} cannot be fetched.`);
          throw new Error(`Project ${params.id} cannot be fetched.`);
        }
        setFetchingProjectState(false)
      } catch (error: any) {
        throw new Error(error.message)
      }

    };
    fetchProject();
  }, [params.id]);

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
    //{/*<EditedVideoOutputDisplay className="size-full" /> */}
    <div className="">{children}</div>
  );
}
