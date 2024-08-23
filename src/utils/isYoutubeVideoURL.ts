export function isYoutubeVideoURL(mediaURL: string) {
  const isYoutubeVideoLinkRegex =
    /^(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;

  return isYoutubeVideoLinkRegex.test(mediaURL);
}