"use client";

import { MediaPlayer, MediaProvider } from '@vidstack/react';

import '@vidstack/react/player/styles/base.css';

function VideoPlayer({
  url,
  aspectRatio = undefined,
  className = "",
  autoPlay = false,
  clipStartTime = 0,
  clipEndTime = undefined,
  controls = true,
  muted = false,
  loop = false,
}: {
  url: string;
  aspectRatio?: string | undefined;
  className?: string;
  autoPlay?: boolean;
  clipStartTime?: number;
  clipEndTime?: number | undefined;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
}) {
  return (
    <MediaPlayer
      src={url}
      controls={controls}
      aspectRatio={aspectRatio}
      controlsDelay={3000}
      hideControlsOnMouseLeave
      className={className}
      autoPlay={autoPlay}
      clipStartTime={clipStartTime}
      clipEndTime={clipEndTime}
      muted={muted}
      loop={loop}

    >
      <MediaProvider />
    </MediaPlayer>
  );
}
export default VideoPlayer