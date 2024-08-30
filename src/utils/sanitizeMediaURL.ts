import { isYoutubeVideoURLValid } from "@/actions/isYoutubeVideoURLValid";

export async function sanitizeMediaURL(mediaURL: string) {
  let sanitizedMediaURL = mediaURL
  function simplifyYouTubeURL(mediaURL: string) {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = mediaURL.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/watch?v=${match[1]}`;
    }
    return mediaURL
  }
  //simplifying only yt bc hosted urls r uniquely formated to their platform, cant simplify
  
  if (await isYoutubeVideoURLValid(mediaURL)) {
    sanitizedMediaURL = simplifyYouTubeURL(mediaURL) 
  }
  return sanitizedMediaURL.replace(/\/+/g, '-');
}