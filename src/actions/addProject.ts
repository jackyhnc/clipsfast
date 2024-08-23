"use server"

import { TProject } from "@/app/studio/types";
import { v4 as uuidv4 } from "uuid";
import ytdl from "ytdl-core";
import { getYoutubeInfo } from "./getYoutubeInfo";
import { isYoutubeVideoURL } from "@/utils/isYoutubeVideoURL";
import { db } from "@/config/firebase";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { deleteProject } from "./deleteProject";
import { addMedia } from "./addMedia";
import { sanitizeMediaURL } from "@/utils/sanitizeMediaURL";

export async function addProject(props: { projectName: string; mediaURL: string; userEmail: string }) {
  const { projectName, mediaURL, userEmail } = props;

  const newProjectID = uuidv4();
  const newProjectDate = new Date();

  let newProjectType: TProject["media"]["type"];
  let newProjectName: TProject["name"] = projectName;
  let newProjectThumbnail: TProject["thumbnail"] = undefined;

  try {
    const mediaDocRef = doc(db, "media", sanitizeMediaURL(mediaURL));
    const mediaDoc = await getDoc(mediaDocRef);
    if (!(mediaDoc.exists())) {
      await addMedia(mediaURL);
    }

    const validateHostedMediaURL = async (mediaURL: string) => {
      try {
        const response = await fetch(mediaURL, { method: "HEAD" });
        if (!response.ok) {
          throw new Error("Failed to fetch video URL.");
        }
        const contentType = response.headers.get("content-type");
        if (!contentType?.startsWith("video")) {
          throw new Error("URL is not a video URL or YouTube video.");
        }
      } catch (error) {
        throw new Error("Invalid video URL.");
      }
    };
    const validateYoutubeURL = async (youtubeLink: string) => {
      try {
        ytdl.validateURL(youtubeLink);
      } catch (error) {
        throw new Error("Invalid YouTube link.");
      }
    };

    if (isYoutubeVideoURL(mediaURL)) {
      await validateYoutubeURL(mediaURL);
      const { title, thumbnails } = await getYoutubeInfo(mediaURL);

      newProjectName = title;
      newProjectThumbnail = thumbnails[3].url;
      newProjectType = "youtube";
    } else {
      await validateHostedMediaURL(mediaURL);

      newProjectType = "hosted";
    }

    const newProject: TProject = {
      ownerEmail: userEmail || "",
      dateCreated: newProjectDate.toISOString(),
      dateCreatedTimestamp: newProjectDate.getTime(),
      projectID: newProjectID,

      media: {
        url: mediaURL,
        type: newProjectType,
      },
      name: newProjectName,
      thumbnail: newProjectThumbnail,
    };

    const newProjectRef = doc(db, "projects", newProjectID);
    const userDocRef = doc(db, "users", userEmail);

    await setDoc(newProjectRef, newProject);

    await updateDoc(userDocRef, {
      projectsIDs: arrayUnion(newProjectID),
    });

    console.log("New project created: ", newProjectID);
    return newProject
  } catch (error: any) {
    error.message = `${error.message}. Unable to create project "${projectName}". Project ID: ${newProjectID}.`;
    console.error(error);

    await deleteProject({ projectID: newProjectID, userEmail });

    throw new Error(error);
  }
}
