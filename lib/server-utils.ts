import type { createClient } from "@/lib/supabase/server";

/**
 * Checks whether the given user has instructor or admin access to a course.
 * Returns true if the user is an admin OR the course's instructor.
 * Returns false if the course doesn't exist.
 */
export async function assertInstructorAccess(
  supabase: ReturnType<typeof createClient>,
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
