"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, NotebookPen } from "lucide-react";

interface LessonNotesProps {
  lessonId: string;
  courseId: string;
}

export function LessonNotes({ lessonId, courseId }: LessonNotesProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/notes?lessonId=${lessonId}`)
      .then((r) => r.json())
      .then((d: { content?: string }) => {
        setContent(d.content ?? "");
        setLoading(false);
      });
  }, [lessonId]);

  const save = useCallback(
    async (value: string) => {
      setSaving(true);
      setSaved(false);
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, courseId, content: value }),
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    [lessonId, courseId]
  );

  const handleChange = (value: string) => {
    setContent(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(value), 1200);
  };

  return (
    <div className="mt-6 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <NotebookPen className="h-4 w-4" />
          My Notes
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          {saving && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </>
          )}
          {saved && !saving && (
            <>
              <CheckCircle className="h-3 w-3 text-green-500" />
              Saved
            </>
          )}
        </div>
      </div>
      {loading ? (
        <div className="h-28 rounded-md border border-border bg-muted/30 animate-pulse" />
      ) : (
        <Textarea
          placeholder="Take notes for this lesson… (auto-saved)"
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          rows={5}
          className="resize-y text-sm"
        />
      )}
    </div>
  );
}
