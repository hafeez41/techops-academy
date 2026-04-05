"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CheckCircle, ChevronRight, Loader2, Trophy, RotateCcw, Play } from "lucide-react";
import { toast } from "sonner";
import { extractYouTubeId } from "@/lib/utils";
import Image from "next/image";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-white/50" />
    </div>
  ),
});

interface VideoPlayerProps {
  playbackId: string | null;
  /** YouTube URL or bare video ID — used when no Mux playback ID is set */
  youtubeUrl?: string | null;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  isEnrolled: boolean;
  nextLessonId: string | null;
  nextCourseId: string | null;
  /** When true, this is the final lesson in the course */
  isLastLesson?: boolean;
  /** Render only the mark-complete / next buttons, no video element */
  controlsOnly?: boolean;
}

const SAVE_INTERVAL_S = 10;
const END_THRESHOLD_S = 10;
const START_THRESHOLD_S = 3;

/** Custom poster + lazy-iframe YouTube player. Only loads the actual iframe
 *  after the user clicks play — faster page load, no YouTube branding on load. */
function YouTubePlayer({ youtubeId }: { youtubeId: string }) {
  const [activated, setActivated] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

  if (activated) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&color=white&modestbranding=1`}
        title="Lesson video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    );
  }

  return (
    <button
      onClick={() => setActivated(true)}
      className="absolute inset-0 w-full h-full group focus:outline-none"
      aria-label="Play video"
    >
      {/* Thumbnail */}
      <Image
        src={thumbnailUrl}
        alt="Video thumbnail"
        fill
        className="object-cover"
        unoptimized
        priority
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-brand/90 border-2 border-brand shadow-[0_0_40px_rgba(217,119,6,0.5)] group-hover:scale-110 group-hover:bg-brand group-hover:shadow-[0_0_60px_rgba(217,119,6,0.7)] transition-all duration-200">
          <Play className="h-7 w-7 text-black fill-black ml-1" />
        </div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">
        click to play
      </div>
    </button>
  );
}

export function VideoPlayer({
  playbackId,
  youtubeUrl,
  lessonId,
  courseId,
  isCompleted,
  isEnrolled,
  nextLessonId,
  nextCourseId,
  isLastLesson = false,
  controlsOnly = false,
}: VideoPlayerProps) {
  const [marking, setMarking] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const [resumePosition, setResumePosition] = useState<number | null>(null);
  const router = useRouter();
  const lastSavedRef = useRef(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  const youtubeId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;
  const hasMux = !!playbackId;
  const hasYoutube = !!youtubeId;

  // Fetch saved resume position on mount — Mux only (YouTube handles its own state)
  useEffect(() => {
    if (!isEnrolled || controlsOnly || !hasMux) return;
    fetch(`/api/video-position?lessonId=${lessonId}`)
      .then((r) => r.json())
      .then(({ position }) => {
        if (position && position > START_THRESHOLD_S) {
          setResumePosition(position);
        }
      })
      .catch(() => {});
  }, [lessonId, isEnrolled, controlsOnly, hasMux]);

  const savePosition = (seconds: number) => {
    if (!isEnrolled) return;
    const now = Date.now();
    if (now - lastSavedRef.current < SAVE_INTERVAL_S * 1000) return;
    lastSavedRef.current = now;
    fetch("/api/video-position", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, position: seconds }),
    }).catch(() => {});
  };

  const handleMarkComplete = async () => {
    setMarking(true);
    if (completed) {
      await fetch("/api/progress", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      setCompleted(false);
      toast.info("Marked as incomplete");
    } else {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, courseId }),
      });
      setCompleted(true);

      if (isLastLesson) {
        toast.success("🎉 Course complete! Congratulations!", {
          description: "You've finished every lesson. Check your dashboard for your certificate.",
          duration: 6000,
          icon: <Trophy className="h-4 w-4 text-yellow-500" />,
        });
      } else {
        toast.success("Lesson complete ✓");
      }
    }
    setMarking(false);
    router.refresh();
  };

  const handleNext = () => {
    if (nextLessonId && nextCourseId) {
      router.push(`/learn/${nextCourseId}/${nextLessonId}`);
    }
  };

  return (
    <div className="space-y-0">
      {!controlsOnly && (
        <div className="rounded-lg overflow-hidden bg-black aspect-video relative">
          {hasMux ? (
            <>
              <MuxPlayer
                ref={playerRef}
                playbackId={playbackId!}
                streamType="on-demand"
                style={{ width: "100%", height: "100%" }}
                startTime={resumePosition ?? undefined}
                onTimeUpdate={(e) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const t = (e.target as any)?.currentTime;
                  if (typeof t === "number") savePosition(t);
                }}
                onDurationChange={(e) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const duration = (e.target as any)?.duration;
                  if (
                    typeof duration === "number" &&
                    resumePosition !== null &&
                    duration - resumePosition < END_THRESHOLD_S
                  ) {
                    setResumePosition(null);
                  }
                }}
                onEnded={() => { if (!completed) handleMarkComplete(); }}
              />

              {/* Resume indicator — Mux only */}
              {resumePosition !== null && resumePosition > START_THRESHOLD_S && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10">
                  <div className="rounded-full bg-black/80 backdrop-blur-sm border border-white/10 px-4 py-2 text-xs text-white flex items-center gap-3 shadow-lg font-mono">
                    <span className="tabular-nums">
                      ↩ {Math.floor(resumePosition / 60)}:{String(Math.floor(resumePosition % 60)).padStart(2, "0")}
                    </span>
                    <button
                      onClick={() => {
                        if (playerRef.current) playerRef.current.currentTime = 0;
                        setResumePosition(null);
                      }}
                      className="flex items-center gap-1 text-white/50 hover:text-white/90 transition-colors"
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                      restart
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : hasYoutube ? (
            <YouTubePlayer youtubeId={youtubeId} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center gap-3 text-zinc-600">
              <Loader2 className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-mono">Video not yet available</span>
            </div>
          )}
        </div>
      )}

      {isEnrolled && (
        <div className="flex items-center gap-3 pt-3 border-t border-border/40">

          {/* Mark complete toggle */}
          <button
            onClick={handleMarkComplete}
            disabled={marking}
            className={`group relative flex items-center gap-2 rounded-md px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${
              completed
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/5 hover:border-emerald-500/20 hover:text-emerald-500/70"
                : "bg-brand/10 border border-brand/30 text-brand hover:bg-brand/15 hover:border-brand/50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {marking ? (
              <Loader2 className="h-3 w-3 animate-spin shrink-0" />
            ) : completed ? (
              <CheckCircle className="h-3 w-3 shrink-0 text-emerald-400" />
            ) : (
              <span className="h-3 w-3 shrink-0 rounded-full border-2 border-brand/60 group-hover:border-brand transition-colors" />
            )}
            {completed ? "completed" : "mark_complete"}
          </button>

          {/* Divider */}
          {nextLessonId && (
            <span className="text-border/60 font-mono text-xs select-none">/</span>
          )}

          {/* Next lesson */}
          {nextLessonId && (
            <button
              onClick={handleNext}
              className="group flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              next_lesson
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
