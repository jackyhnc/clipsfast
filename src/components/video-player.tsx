"use client";

import { MediaPlayer, MediaProvider } from '@vidstack/react';

import '@vidstack/react/player/styles/base.css';


interface Props {
    url: string
}

function VideoPlayer({url}: Props) {
  return (
        <MediaPlayer 
            src={url} 
            controls
            aspectRatio='9/16'
            controlsDelay={1000}
        >
            <MediaProvider />
        </MediaPlayer>
  )
}

export default VideoPlayer