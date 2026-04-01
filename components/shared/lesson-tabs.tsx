"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";

interface LessonFile { id: string; name: string; url: string; size?: number | null }

interface LessonTabsProps {
  description: string | null;
  files: LessonFile[];
}

export function LessonTabs({ description, files }: LessonTabsProps) {
  const [tab, setTab] = useState<"overview" | "resources">("overview");

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    ...(files.length > 0
      ? [{ id: "resources" as const, label: `Resources (${files.length})` }]
      : []),
  ];

  return (
    <div>
      <div className="flex border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="py-4">
        {tab === "overview" ? (
          description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No description available for this lesson.</p>
          )
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{file.name}</span>
                {file.size && (
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground/60">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
