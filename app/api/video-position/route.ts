import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/video-position?lessonId=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ position: 0 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ position: 0 });

  const { data } = await supabase
    .from("video_positions")
    .select("position_seconds")
    .eq("student_id", user.id)
    .eq("lesson_id", lessonId)
    .single();

  return NextResponse.json({ position: data?.position_seconds ?? 0 });
}

// POST /api/video-position
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, position } = await req.json();
  if (!lessonId || typeof position !== "number") {
    return NextResponse.json({ error: "lessonId and position required" }, { status: 400 });
  }

  const { error } = await supabase.from("video_positions").upsert(
    {
      student_id: user.id,
      lesson_id: lessonId,
      position_seconds: position,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,lesson_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
