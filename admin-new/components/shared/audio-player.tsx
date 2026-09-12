"use client";

import { useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SPEEDS = [0.75, 1, 1.25] as const;

export function AudioPlayer({
  src,
  label = "Pronunciation",
}: {
  src?: string;
  label?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);

  if (!src) {
    return (
      <div className="flex items-center gap-2 rounded-default border border-dashed border-border-strong bg-neutral-bg px-3 py-2.5 text-sm text-text-muted">
        <Volume2 className="h-4 w-4" aria-hidden="true" />
        Audio not generated yet
      </div>
    );
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setIsPlaying(false));
    }
    setIsPlaying(!isPlaying);
  }

  function changeSpeed(next: (typeof SPEEDS)[number]) {
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  return (
    <div className="flex items-center gap-3 rounded-default border border-border bg-white px-3 py-2.5">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          setProgress(el.duration ? (el.currentTime / el.duration) * 100 : 0);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
      />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? `Pause ${label}` : `Play ${label}`}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
      </button>

      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-shrink-0 gap-0.5" role="group" aria-label="Playback speed">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => changeSpeed(s)}
            aria-pressed={speed === s}
            className={cn(
              "rounded-sm px-1.5 py-1 text-[11px] font-medium transition-colors",
              speed === s
                ? "bg-accent-light text-accent"
                : "text-text-muted hover:bg-neutral-bg",
            )}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
