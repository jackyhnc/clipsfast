import { NextResponse } from "next/server";


export const POST = async ()=> {
  const videoId = "anyN8lj51Ds"
  const apiKey = "AIzaSyAhFp04qnyOwXwbS0A2KFbDLT35gMOeMCQ"; // Store your API key in environment variables

  try {
    
    const response = 
      await fetch("https://www.youtube.com/watch?v=2TL3DgIMY1g")    
    

    return NextResponse.json(response)

  } catch (error) {
      console.error('Error fetching captions:', error);
      return NextResponse.json("caught error")
    }
}

/*
async function getCaptionsList(videoId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.items;
}

async function downloadCaption(captionId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/captions/${captionId}?tfmt=srt&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }
  const text = await response.text();
  return text;
}
*/
