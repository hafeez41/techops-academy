import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMux } from "@/lib/mux";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const courseId = params.id;

  // 1. Fetch course for thumbnail cleanup
  const { data: course } = await supabase.from("courses").select("thumbnail_url").eq("id", courseId).single();

  // 2. Fetch all lessons (need mux_asset_id for Mux deletion)
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, mux_asset_id")
    .eq("course_id", courseId);

  // 3. Fetch all lesson files for storage cleanup
  const lessonIds = lessons?.map((l) => l.id) ?? [];
  const { data: lessonFiles } = lessonIds.length
    ? await supabase.from("lesson_files").select("url").in("lesson_id", lessonIds)
    : { data: [] };

  // 4. Delete Mux assets
  const mux = getMux();
  const muxDeletions = (lessons ?? [])
    .filter((l) => l.mux_asset_id)
    .map((l) => mux.video.assets.delete(l.mux_asset_id!).catch(() => {}));
  await Promise.all(muxDeletions);

  // 5. Delete lesson files from Supabase storage (parse path from public URL)
  const filePaths = (lessonFiles ?? [])
    .map((f) => {
      try {
        return new URL(f.url).pathname.replace(/^\/storage\/v1\/object\/public\/lesson-files\//, "");
      } catch { return null; }
    })
    .filter(Boolean) as string[];
  if (filePaths.length) {
    await supabase.storage.from("lesson-files").remove(filePaths);
  }

  // 6. Delete thumbnail from storage
  if (course?.thumbnail_url) {
    const url = new URL(course.thumbnail_url);
    // Path after /object/public/thumbnails/
    const storagePath = url.pathname.replace(/^\/storage\/v1\/object\/public\/thumbnails\//, "");
    if (storagePath) await supabase.storage.from("thumbnails").remove([storagePath]);
  }

  // 7. Delete DB records (order matters for FK constraints)
  // Use service client so RLS on enrollments/progress/reviews doesn't block cascade
  const adminClient = createServiceClient();
  if (lessonIds.length) {
    await adminClient.from("lesson_files").delete().in("lesson_id", lessonIds);
  }
  await Promise.all([
    adminClient.from("lessons").delete().eq("course_id", courseId),
    adminClient.from("enrollments").delete().eq("course_id", courseId),
    adminClient.from("progress").delete().eq("course_id", courseId),
    adminClient.from("reviews").delete().eq("course_id", courseId),
  ]);
  await adminClient.from("courses").delete().eq("id", courseId);

  return NextResponse.json({ success: true });
}
