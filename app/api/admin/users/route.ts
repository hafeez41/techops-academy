import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function assertAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// PATCH — update a user's role
export async function PATCH(req: Request) {
  const supabase = createClient();
  const admin = await assertAdmin(supabase);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, role } = await req.json();
  if (!userId || !role) return NextResponse.json({ error: "userId and role required" }, { status: 400 });
  if (!["admin", "instructor", "student"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const adminClient = createServiceClient();
  const { error } = await adminClient.from("profiles").update({ role }).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — remove a user profile
export async function DELETE(req: Request) {
  const supabase = createClient();
  const admin = await assertAdmin(supabase);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const adminClient = createServiceClient();
  const { error } = await adminClient.from("profiles").delete().eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
