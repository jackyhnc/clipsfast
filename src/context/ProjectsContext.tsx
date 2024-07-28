"use client";

import { TClip, TProject, TProjectEditingConfigs } from "@/app/studio/types";
import { useState, createContext, useContext } from "react";

const defaultContext = {};
const ProjectsContext = createContext(defaultContext);

export function ProjectsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [project, setProject] = useState<TProject | undefined>(undefined);
  const [fetchingProjectState, setFetchingProjectState] = useState(true)
  const [configs, setConfigs] = useState<TProjectEditingConfigs | undefined>(
    undefined
  )

  const [clips, setClips] = useState<Array<TClip>>([])

  return (
    <ProjectsContext.Provider
      value={{ 
        project, setProject, 
        fetchingProjectState, setFetchingProjectState,
        
        configs, setConfigs, 
        clips, setClips, 
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export const useProjectsContext = () => {
  return useContext(ProjectsContext);
};
