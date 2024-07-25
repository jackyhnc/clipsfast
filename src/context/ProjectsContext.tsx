"use client";

import { TProject, TProjectEditingConfigs } from "@/app/studio/types";
import { useState, createContext, useContext } from "react";

const defaultContext = {};
const ProjectsContext = createContext(defaultContext);

export function ProjectsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [project, setProject] = useState<TProject | undefined>(undefined);
  const [configs, setConfigs] = useState<TProjectEditingConfigs | undefined>(
    undefined
  )

  return (
    <ProjectsContext.Provider
      value={{ project, setProject, configs, setConfigs }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export const useProjectsContext = () => {
  return useContext(ProjectsContext);
};
