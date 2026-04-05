import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(name: string | null | undefined): string {
  return (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Format total seconds as "1h 23m" or "45m" — for course/card duration labels */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Format seconds as "4:07" — for individual lesson timestamps */
export function formatLessonDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Format byte count as "2.4MB", "512KB", etc. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Extract a YouTube video ID from any standard YouTube URL.
 * Handles: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID,
 *          youtube.com/shorts/ID, and already-bare IDs (11 chars).
 * Returns null if the string is not a recognizable YouTube URL.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // Already a bare video ID (11 alphanumeric chars)
  if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim();
  try {
    const u = new URL(url);
    // youtu.be/ID
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split(/[?&#]/)[0] || null;
    // youtube.com/embed/ID, /shorts/ID, /v/ID
    const pathMatch = u.pathname.match(/\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{11})/);
    if (pathMatch) return pathMatch[1];
    // youtube.com/watch?v=ID
    const v = u.searchParams.get("v");
    if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
  } catch {
    // not a valid URL
  }
  return null;
}
