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
  transcript: string,

  time: {
    start: number,
    end: number,
  }
}