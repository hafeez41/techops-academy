"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";

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
}

export function VideoPlayer({
  playbackId,
  lessonId,
  courseId,
  isCompleted,
  isEnrolled,
  nextLessonId,
  nextCourseId,
}: VideoPlayerProps) {
  const [marking, setMarking] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const router = useRouter();

  const handleMarkComplete = async () => {
    setMarking(true);
    if (completed) {
      await fetch("/api/progress", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      setCompleted(false);
    } else {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, courseId }),
      });
      setCompleted(true);
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
      <div className="rounded-lg overflow-hidden bg-black aspect-video">
        <MuxPlayer
          playbackId={playbackId}
          streamType="on-demand"
          style={{ width: "100%", height: "100%" }}
          onEnded={() => { if (!completed) handleMarkComplete(); }}
        />
      </div>

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
