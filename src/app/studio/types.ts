export type TProject = {
  ownerEmail: string;
  projectID: string;
  dateCreated: string;
  dateCreatedTimestamp: number;

  media: {
    url: string,
    type: TMedia["type"],
  };

  name: string | undefined;
  thumbnail: string | undefined;
};

export type TProjectEditingConfigs = {
  captions?: {
    type: undefined,
    position: {
      x: number,
      y: number,
    }
  };

  time: {
    start: number,
    end: number,
  }
};

export type TClip = {
  id: string,

  title: string,
  transcript: string | undefined,
  
  transcriptID: string,

  time: {
    start: number,
    end: number,
  }

  mediaURL: string,

  creationTime: number,
}

export type TClipProcessed = TClip & {
  thumbnail: string,
  
  generatedURL: string //s3 link to generated clip, cannot be undefined bc firebase cant store undefined

}

export type TMedia = {
  url: string,

  durationInMinutes?: number,

  type: "hosted" | "youtube",

  clips: Array<TClip>,

  percentAnalyzed: number, // like 0.24
}

export type TActionInProgress = {
  mediaURLBeingAnalyzed: string,
  startTime: number,
}
export type TUser = {
  email: string,
  name: string,

  projectsIDs: Array<string>,

  userPlan: "free" | "lite" | "pro" | "max" | "enterprise",
  minutesAnalyzedThisMonth: number, 
  lifetimeMinutesAnalyzed: number,

  actionsInProgress: TActionInProgress[]

  clipsInProgress: TClip[]
  clipsProcessed: TClipProcessed[]

  //free 1 hr / small watermark
  //$9.90 lite 15 hr,     creators
  //$19.90 pro 35 hr,     clippers
  //$70 max 150 hr,       agencies

  //$100 enterprise idk

}