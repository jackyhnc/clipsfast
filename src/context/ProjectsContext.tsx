"use client";

import { TClip, TMedia, TProject, TProjectEditingConfigs } from "@/app/studio/types";
import { db } from "@/config/firebase";
import { sanitizeMediaURL } from "@/utils/sanitizeMediaURL";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useState, createContext, useContext, useEffect } from "react";

const defaultContext = {};
const ProjectsContext = createContext(defaultContext);

export function ProjectsContextProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<TProject | undefined>(undefined);
  const [fetchingProjectState, setFetchingProjectState] = useState(true);

  const [configs, setConfigs] = useState<TProjectEditingConfigs | undefined>(undefined);

  const [media, setMedia] = useState<TMedia | undefined>(undefined);
  const [fetchingMediaState, setFetchingMediaState] = useState(true);

  useEffect(() => {
    setFetchingMediaState(true);
    if (project) {
      const fetchMedia = async () => {
        const mediaRef = doc(db, `media/${await sanitizeMediaURL(project.media.url)}`);
        const unsubscribe = onSnapshot(mediaRef, (mediaDocSnap) => {
          if (mediaDocSnap.exists()) {
            const fetchedMedia = mediaDocSnap.data() as TMedia;
            setMedia(fetchedMedia);
          } else {
            console.error(`Media ${project?.media.url} cannot be fetched.`);
          }
          setFetchingMediaState(false);
        });
        return () => unsubscribe();
      };
      fetchMedia();
    }
  }, [project]);

  return (
    <ProjectsContext.Provider
      value={{
        project,
        setProject,
        fetchingProjectState,
        setFetchingProjectState,

        configs,
        setConfigs,

        media,
        setMedia,
        fetchingMediaState,
        setFetchingMediaState,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export const useProjectsContext = () => {
  return useContext(ProjectsContext);
};
