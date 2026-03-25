import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const [
    { count: totalUsers },
    { count: totalEnrollments },
    { data: recentUsers },
    { data: allCourses },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("enrollments").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("courses")
      .select("id, title, slug, is_published, price, category, created_at, instructor_id, profiles(full_name)")
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
        courses={(allCourses ?? []) as any[]}
        adminId={user.id}
      />
    </div>
  );
}
