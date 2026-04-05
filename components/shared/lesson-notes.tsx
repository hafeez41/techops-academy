"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface LessonNotesProps {
  lessonId: string;
  courseId: string;
}

export function LessonNotes({ lessonId, courseId }: LessonNotesProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [focused, setFocused] = useState(false);
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
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, courseId, content: value }),
      });
      setSaving(false);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error("Failed to save notes. Please try again.");
      }
    },
    [lessonId, courseId]
  );

  const handleChange = (value: string) => {
    setContent(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(value), 1200);
  };

  return (
    <div className="mt-4 space-y-0">

      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
            scratch
          </span>
          <span className="font-mono text-[9px] text-muted-foreground/25">/</span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
            notes.md
          </span>
        </div>

        {/* Save status */}
        <div className="font-mono text-[9px] flex items-center gap-1 tabular-nums">
          {saving && (
            <span className="flex items-center gap-1 text-muted-foreground/40">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              writing…
            </span>
          )}
          {saved && !saving && (
            <span className="flex items-center gap-1 text-emerald-500/60">
              <CheckCircle className="h-2.5 w-2.5" />
              saved
            </span>
          )}
        </div>
      </div>

      {/* Editor container */}
      <div
        className={`relative rounded-lg border transition-colors duration-150 overflow-hidden ${
          focused
            ? "border-brand/30 bg-card"
            : "border-border/40 bg-muted/20"
        }`}
      >
        {/* Line numbers strip */}
        {!loading && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 flex flex-col pt-2.5 pb-2.5 border-r border-border/20"
            style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
          >
            {(content || " ").split("\n").map((_, i) => (
              <span
                key={i}
                className="font-mono text-[9px] text-muted-foreground/20 text-right pr-2 leading-5 tabular-nums select-none"
              >
                {i + 1}
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="h-32 flex flex-col gap-1.5 p-3 pl-10">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-2 rounded animate-pulse bg-muted/60"
                style={{ width: `${[65, 42, 78, 30][i]}%` }}
              />
            ))}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`// notes for this lesson\n// auto-saved as you type`}
            rows={6}
            spellCheck={false}
            className="w-full resize-y bg-transparent pl-10 pr-3 py-2.5 font-mono text-[12px] leading-5 text-foreground placeholder:text-muted-foreground/25 focus:outline-none min-h-[7rem]"
            style={{ caretColor: "hsl(38,85%,50%)" }}
          />
        )}
      </div>
    </div>
  );
}
