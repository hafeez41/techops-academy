"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MuxPlayer from "@mux/mux-player-react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";

interface VideoPlayerProps {
  playbackId: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  nextLessonId: string | null;
  nextCourseId: string | null;
}

export function VideoPlayer({
  playbackId,
  lessonId,
  courseId,
  isCompleted,
  nextLessonId,
  nextCourseId,
}: VideoPlayerProps) {
  const [marking, setMarking] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const router = useRouter();

  const handleMarkComplete = async () => {
    if (completed) return;
    setMarking(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, courseId }),
    });
    setCompleted(true);
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
          onEnded={handleMarkComplete}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant={completed ? "secondary" : "default"}
          size="sm"
          onClick={handleMarkComplete}
          disabled={completed || marking}
        >
          {marking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          {completed ? "Completed" : "Mark as complete"}
        </Button>

        {nextLessonId && (
          <Button variant="outline" size="sm" onClick={handleNext}>
            Next lesson
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
