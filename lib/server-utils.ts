import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = ReturnType<typeof createClient>;

/**
 * Returns the authenticated user or null.
 * Use at the top of every API route instead of repeating the auth boilerplate.
 */
export async function getAuthUser(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

/**
 * Returns the role of a user profile, or null if not found.
 */
export async function getUserRole(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return (data?.role ?? null) as "admin" | "instructor" | "student" | null;
}

/**
 * Checks whether the given user has instructor or admin access to a course.
 * Returns true if the user is an admin OR the course's instructor.
 * Returns false if the course doesn't exist.
 */
export async function assertInstructorAccess(
  supabase: SupabaseClient,
  courseId: string,
  userId: string
): Promise<boolean> {
  const [{ data: profile }, { data: course }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", userId).single(),
    supabase.from("courses").select("id, instructor_id").eq("id", courseId).single(),
  ]);
  if (!course) return false;
  if (profile?.role === "admin") return true;
  return course.instructor_id === userId;
}
