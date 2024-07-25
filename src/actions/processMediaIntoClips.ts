"use server"

export async function processMediaIntoClips(mediaURL: string) {
  fetch("https://mkpogdgywg.execute-api.us-east-1.amazonaws.com/prod", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mediaURL: mediaURL
    }),
  })
  
}