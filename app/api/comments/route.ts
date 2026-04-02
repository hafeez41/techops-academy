import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getRequestKey } from "@/lib/rate-limit";

// GET /api/comments?lessonId=&courseId=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");
  const courseId = searchParams.get("courseId");
  if (!lessonId || !courseId) {
    return NextResponse.json({ error: "lessonId and courseId required" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("lesson_comments")
    .select("*, profiles(full_name, avatar_url)")
    .eq("lesson_id", lessonId)
    .eq("course_id", courseId)
    .is("parent_id", null) // top-level only
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch replies for each top-level comment
  const commentIds = (data ?? []).map((c) => c.id);
  let replies: Record<string, unknown[]> = {};
  if (commentIds.length > 0) {
    const { data: replyRows } = await supabase
      .from("lesson_comments")
      .select("*, profiles(full_name, avatar_url)")
      .in("parent_id", commentIds)
      .order("created_at", { ascending: true });

    for (const r of replyRows ?? []) {
      if (!replies[r.parent_id]) replies[r.parent_id] = [];
      replies[r.parent_id].push(r);
    }
  }

  const comments = (data ?? []).map((c) => ({
    ...c,
    replies: replies[c.id] ?? [],
  }));

  return NextResponse.json({ comments });
}

// POST /api/comments
export async function POST(req: Request) {
  const rl = rateLimit(getRequestKey(req, "comments"), { limit: 20, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, courseId, body, parentId } = await req.json();
  if (!lessonId || !courseId || !body?.trim()) {
    return NextResponse.json({ error: "lessonId, courseId and body required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("lesson_comments")
    .insert({
      lesson_id: lessonId,
      course_id: courseId,
      student_id: user.id,
      parent_id: parentId ?? null,
      body: body.trim(),
    })
    .select("*, profiles(full_name, avatar_url)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: { ...data, replies: [] } });
}

// DELETE /api/comments?id=
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("lesson_comments")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
