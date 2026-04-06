import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function assertAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// PATCH — toggle course published state
export async function PATCH(req: Request) {
  const supabase = createClient();
  const admin = await assertAdmin(supabase);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { courseId, is_published } = await req.json();
  if (!courseId || typeof is_published !== "boolean") {
    return NextResponse.json({ error: "courseId and is_published required" }, { status: 400 });
  }

  const adminClient = createServiceClient();
  const { error } = await adminClient.from("courses").update({ is_published }).eq("id", courseId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
