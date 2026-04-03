"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-white/50" />
    </div>
  ),
});

interface VideoPlayerProps {
  playbackId: string;
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

export function VideoPlayer({
  playbackId,
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

  // Fetch saved resume position on mount
  useEffect(() => {
    if (!isEnrolled || controlsOnly || !playbackId) return;
    fetch(`/api/video-position?lessonId=${lessonId}`)
      .then((r) => r.json())
      .then(({ position }) => {
        if (position && position > START_THRESHOLD_S) {
          setResumePosition(position);
        }
      })
      .catch(() => {});
  }, [lessonId, isEnrolled, controlsOnly, playbackId]);

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
    <div className="space-y-4">
      {!controlsOnly && (
        <div className="rounded-lg overflow-hidden bg-black aspect-video relative">
          <MuxPlayer
            ref={playerRef}
            playbackId={playbackId}
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

          {/* Resume toast */}
          {resumePosition !== null && resumePosition > START_THRESHOLD_S && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10">
              <div className="rounded-full bg-black/80 backdrop-blur-sm border border-white/10 px-4 py-2 text-xs text-white flex items-center gap-3 shadow-lg">
                <span>Resumed from {Math.floor(resumePosition / 60)}:{String(Math.floor(resumePosition % 60)).padStart(2, "0")}</span>
                <button
                  onClick={() => {
                    if (playerRef.current) playerRef.current.currentTime = 0;
                    setResumePosition(null);
                  }}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isEnrolled && (
        <div className="flex items-center gap-3">
          <Button
            variant={completed ? "secondary" : "default"}
            size="sm"
            onClick={handleMarkComplete}
            disabled={marking}
          >
            {marking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className={`mr-2 h-4 w-4 ${completed ? "text-green-500" : ""}`} />
            )}
            {completed ? "Mark as incomplete" : "Mark as complete"}
          </Button>

          {nextLessonId && (
            <Button variant="outline" size="sm" onClick={handleNext}>
              Next lesson
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
