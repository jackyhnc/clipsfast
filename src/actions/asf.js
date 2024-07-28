async function processMediaIntoClips(mediaURL) {
  const response = await fetch("https://mkpogdgywg.execute-api.us-east-1.amazonaws.com/prod", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mediaURL: mediaURL
    }),
  })
  
  return await response.json()
}

async function asdf () {
  const r = await processMediaIntoClips("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  console.log(r) 
}

asdf()
