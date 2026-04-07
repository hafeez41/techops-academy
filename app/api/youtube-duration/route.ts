import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/utils";

/**
 * GET /api/youtube-duration?url=<youtube_url>
 *
 * Returns the duration in seconds for a YouTube video by calling the
 * YouTube Data API v3. Only accessible to authenticated instructors/admins.
 *
 * Requires YOUTUBE_API_KEY env var (server-side only, never exposed to client).
 */
export async function GET(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["instructor", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url param required" }, { status: 400 });

  const videoId = extractYouTubeId(url);
  if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY not configured" }, { status: 500 });
  }

  const ytUrl =
    `https://www.googleapis.com/youtube/v3/videos` +
    `?part=contentDetails&id=${videoId}&key=${apiKey}`;

  const res = await fetch(ytUrl);
  if (!res.ok) {
    return NextResponse.json({ error: "YouTube API error" }, { status: 502 });
  }

  const json = await res.json();
  const item = json.items?.[0];
  if (!item) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  // ISO 8601 duration e.g. "PT1H23M45S", "PT2M30S", "PT45S"
  const iso = item.contentDetails?.duration as string;
  const seconds = parsePTDuration(iso);

  return NextResponse.json({ videoId, duration_seconds: seconds });
}

/** Parse ISO 8601 duration string → total seconds */
function parsePTDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] ?? "0", 10);
  const m = parseInt(match[2] ?? "0", 10);
  const s = parseInt(match[3] ?? "0", 10);
  return h * 3600 + m * 60 + s;
}
