"use server"

import { db } from "@/config/firebase";
import { arrayRemove, deleteDoc, doc, updateDoc } from "firebase/firestore";

export async function deleteProject(props: { projectID: string; userEmail: string }) {
  const { projectID, userEmail } = props;

  const projectRef = doc(db, "projects", projectID);
  const userDocRef = doc(db, "users", userEmail);

  try {
    await deleteDoc(projectRef);
    await updateDoc(userDocRef, {
      projectsIDs: arrayRemove(projectID),
    });
  } catch (error: any) {
    console.error(error);

    error.message = `Unable to delete project. Project ID: ${projectID}`;

    throw new Error(error);
  }
};