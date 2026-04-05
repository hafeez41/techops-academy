"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface LessonFile { id: string; name: string; url: string; size?: number | null }

interface LessonTabsProps {
  description: string | null;
  files: LessonFile[];
}

export function LessonTabs({ description, files }: LessonTabsProps) {
  const [tab, setTab] = useState<"overview" | "resources">("overview");

  const tabs = [
    { id: "overview" as const, label: "overview" },
    ...(files.length > 0
      ? [{ id: "resources" as const, label: `resources` }]
      : []),
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-border/40">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-1.5 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors ${
              tab === t.id
                ? "text-brand"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.id === "resources" && files.length > 0 && (
              <span className={`font-mono text-[9px] tabular-nums px-1 rounded ${
                tab === t.id ? "text-brand/70" : "text-muted-foreground/60"
              }`}>
                {files.length}
              </span>
            )}
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-brand" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="py-4">
        {tab === "overview" ? (
          description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          ) : (
            <p className="font-mono text-[11px] text-muted-foreground/50 italic">— no description —</p>
          )
        ) : (
          <div className="space-y-0.5">
            {files.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-muted/40"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-brand transition-colors" />
                <span className="font-mono text-[11px] text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  {file.name}
                </span>
                <div className="ml-auto flex items-center gap-2 shrink-0">
                  {file.size && (
                    <span className="font-mono text-[9px] text-muted-foreground/40 tabular-nums">
                      {formatBytes(file.size)}
                    </span>
                  )}
                  <Download className="h-3 w-3 text-muted-foreground/30 group-hover:text-brand transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
