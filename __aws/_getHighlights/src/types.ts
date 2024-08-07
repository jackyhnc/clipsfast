export type TClip = {
  title: string,

  time: {
    start: number,
    end: number,
  }

  url: "" //s3 link to generated clip
}

type TClipsConfig = {
  clipsLengthRangeInSeconds: string,
  clipsPreferredContentPrompt: string, 
  clipsPreferredTitlePrompt: string,
}
export type TEvent = {
  videoURL: string,
  clipsConfig: TClipsConfig,
}