import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  // Service client bypasses RLS — admin needs to read all users/enrollments/courses
  const adminClient = createServiceClient();

  const [
    { count: totalUsers },
    { count: totalEnrollments },
    { data: recentUsers },
    { data: allCourses },
  ] = await Promise.all([
    adminClient.from("profiles").select("id", { count: "exact", head: true }),
    adminClient.from("enrollments").select("id", { count: "exact", head: true }),
    adminClient
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    adminClient
      .from("courses")
      .select("id, title, slug, is_published, price, categories, description, thumbnail_url, created_at, instructor_id, profiles(full_name)")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AdminDashboard
        stats={{
          totalUsers: totalUsers ?? 0,
          totalCourses: allCourses?.length ?? 0,
          totalEnrollments: totalEnrollments ?? 0,
        }}
        recentUsers={recentUsers ?? []}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        courses={(allCourses ?? []) as any}
        adminId={user.id}
      />
    </div>
  );
}
