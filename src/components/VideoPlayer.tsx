"use client";

import { MediaPlayer, MediaProvider } from '@vidstack/react';

import '@vidstack/react/player/styles/base.css';

interface Props {
    url: string,
    aspectRatio?: string
}

function VideoPlayer({url, aspectRatio}: Props) {
    return (
        <MediaPlayer 
            src={url} 
            controls
            aspectRatio={aspectRatio?? "auto"}
            hideControlsOnMouseLeave
            
        >
            <MediaProvider />
        </MediaPlayer>

    )
}
export default VideoPlayer