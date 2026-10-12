
import { useState } from "react";

export default function FloatingVideo() {
  const [visible, setVisible] = useState(true);
  const [muted, setMuted] = useState(true);

  if (!visible) return null;

  return (
    <div className="webli-floating-video">
      <button
        className="webli-video-close"
        onClick={() => setVisible(false)}
        aria-label="Close video"
      >
        ×
      </button>

      <video
        src="/videos/webli-intro.mp4"
        autoPlay
        muted={muted}
        loop
        playsInline
      />

      <button
        className="webli-video-sound"
        onClick={() => setMuted((value) => !value)}
      >
        {muted ? "Unmute" : "Mute"}
      </button>
    </div>
  );
}
