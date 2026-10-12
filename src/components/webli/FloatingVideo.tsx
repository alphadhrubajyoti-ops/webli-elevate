import { useState } from "react";
import introVideo from "../../assets/webli-intro.mp4";

export default function FloatingVideo() {
  const [visible, setVisible] = useState(true);
  const [muted, setMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  if (!visible) return null;

  return (
    <div className="webli-floating-video">
      <button
        type="button"
        className="webli-video-close"
        onClick={() => setVisible(false)}
        aria-label="Close video"
      >
        ×
      </button>

      {videoError ? (
        <div className="webli-video-error">
          <strong>Video could not load</strong>
          <span>Please check the MP4 file.</span>
        </div>
      ) : (
        <video
          className="webli-video-player"
          src={introVideo}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="auto"
          onError={() => setVideoError(true)}
        />
      )}

      {!videoError && (
        <button
          type="button"
          className="webli-video-sound"
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      )}
    </div>
  );
}
