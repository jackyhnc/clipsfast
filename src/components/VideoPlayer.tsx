"use client";

import { MediaPlayer, MediaProvider } from '@vidstack/react';

import '@vidstack/react/player/styles/base.css';

interface VideoPlayerProps {
  url: string;
  aspectRatio?: string;
  className?: string;
  autoPlay?: boolean;
  clipStartTime?: number;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
}

function VideoPlayer({
  url,
  aspectRatio = "auto",
  className = "",
  autoPlay = false,
  clipStartTime = 0,
  controls = true,
  muted = false,
  loop = false,
}: VideoPlayerProps) {
  return (
    <MediaPlayer
      src={url}
      controls={controls}
      aspectRatio={aspectRatio}
      controlsDelay={30000}
      hideControlsOnMouseLeave
      className={className}
      autoPlay={autoPlay}
      clipStartTime={clipStartTime}
      muted={muted}
      loop={loop}
    >
      <MediaProvider />
    </MediaPlayer>
  );
}
export default VideoPlayer