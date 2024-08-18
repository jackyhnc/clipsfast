export type TProject = {
  ownerEmail: string;
  projectID: string;
  dateCreated: string;
  dateCreatedTimestamp: number;

  media: {
    url: string;
    type: "hosted" | "youtube" | undefined;
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
  title: string,

  time: {
    start: number,
    end: number,
  }

  url: "" //s3 link to generated clip
}

export type TMedia = {
  url: string,
  type: "hosted" | "youtube",

  clips: Array<TClip>,

  percentAnalyzed: number,
}

export type TUser = {
  email: string,
  name: string,

  projectsIDs: Array<string>,

  userPlan: "free" | "lite" | "pro" | "max" | "enterprise",
  minutesAnalyzed: number, 

  //free 1 hr / small watermark
  //$9.90 lite 15 hr,     creators
  //$19.90 pro 35 hr,     clippers
  //$70 max 150 hr,       agencies

  //$100 enterprise idk

}