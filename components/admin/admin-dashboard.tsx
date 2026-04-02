"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminCourseBuilder } from "@/components/admin/admin-course-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, TrendingUp, Eye, EyeOff, Shield,
  GraduationCap, UserCheck, PlusCircle, Pencil, Trash2,
} from "lucide-react";
import { AnalyticsPanel } from "@/components/shared/analytics-panel";

interface Profile {
  id: string; full_name: string | null; email: string | null;
  role: string | null; created_at: string;
}
interface Course {
  id: string; title: string; slug: string; is_published: boolean;
  price: number; categories: string[]; created_at: string;
  instructor_id: string; description: string | null;
  thumbnail_url: string | null;
  profiles: { full_name: string | null } | null;
}
interface Stats { totalUsers: number; totalCourses: number; totalEnrollments: number }

export function AdminDashboard({
  stats: initialStats,
  recentUsers: initialUsers,
  courses: initialCourses,
  adminId,
}: {
  stats: Stats;
  recentUsers: Profile[];
  courses: Course[];
  adminId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<"overview" | "users" | "courses" | "analytics">("overview");
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "course" | "user"; id: string; name: string } | null>(null);

  // Course builder state
  const [builderCourse, setBuilderCourse] = useState<Course | null | "new">(null); // null = list, "new" = new, Course = editing

  const refresh = () => router.refresh();

  const handleBuilderBack = async () => {
    setBuilderCourse(null);
    const { data } = await supabase
      .from("courses")
      .select("id, title, slug, is_published, price, categories, created_at, instructor_id, description, thumbnail_url, profiles(full_name)")
      .order("created_at", { ascending: false });
    if (data) setCourses(data as unknown as Course[]);
    router.refresh();
  };

  // --- Course actions ---
  const togglePublish = async (course: Course) => {
    setUpdatingId(course.id);
    await supabase.from("courses").update({ is_published: !course.is_published }).eq("id", course.id);
    setCourses((p) => p.map((c) => c.id === course.id ? { ...c, is_published: !c.is_published } : c));
    setUpdatingId(null);
  };

  const deleteCourse = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    setCourses((p) => p.filter((c) => c.id !== id));
    setDeletingId(null);
    setConfirmDelete(null);
  };

  // --- User actions ---
  const setRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setUsers((p) => p.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    setUpdatingId(null);
  };

  const deleteUser = async (id: string) => {
    setDeletingId(id);
    // Delete profile (auth user deletion requires service role — just remove profile for now)
    await supabase.from("profiles").delete().eq("id", id);
    setUsers((p) => p.filter((u) => u.id !== id));
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const roleIcon = (role: string | null) => {
    if (role === "admin") return <Shield className="h-3.5 w-3.5 text-red-500" />;
    if (role === "instructor") return <GraduationCap className="h-3.5 w-3.5 text-blue-500" />;
    return <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />;
  };
  const roleBadge = (role: string | null): "destructive" | "secondary" | "outline" => {
    if (role === "admin") return "destructive";
    if (role === "instructor") return "secondary";
    return "outline";
  };

  // --- Confirm dialog ---
  const ConfirmDialog = () => {
    if (!confirmDelete) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="rounded-xl border border-border bg-card p-6 shadow-xl max-w-sm w-full mx-4">
          <h3 className="font-semibold text-base">Delete {confirmDelete.type}?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">"{confirmDelete.name}"</span> will be permanently deleted. This cannot be undone.
          </p>
          <div className="mt-5 flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" size="sm"
              disabled={deletingId === confirmDelete.id}
              onClick={() => confirmDelete.type === "course" ? deleteCourse(confirmDelete.id) : deleteUser(confirmDelete.id)}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const statColors = {
    blue:  { bg: "bg-blue-500/10",  icon: "text-blue-500"  },
    green: { bg: "bg-green-500/10", icon: "text-green-500" },
    brand: { bg: "bg-brand/10",     icon: "text-brand"     },
  } as const;

  // If we're in the course builder view
  if (builderCourse !== null) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminCourseBuilder
          course={builderCourse === "new" ? null : builderCourse as Course}
          adminId={adminId}
          onBack={handleBuilderBack}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ConfirmDialog />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage everything from one place</p>
        </div>
        <Badge variant="destructive" className="gap-1.5">
          <Shield className="h-3.5 w-3.5" /> Admin
        </Badge>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {(["overview", "users", "courses", "analytics"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total Users", value: initialStats.totalUsers, icon: Users, color: "blue" as const },
              { label: "Total Courses", value: courses.length, icon: BookOpen, color: "green" as const },
              { label: "Enrollments", value: initialStats.totalEnrollments, icon: TrendingUp, color: "brand" as const },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`rounded-full p-3 ${statColors[color].bg}`}>
                    <Icon className={`h-5 w-5 ${statColors[color].icon}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent Users</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setTab("users")}>View all</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {users.slice(0, 6).map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <p className="text-sm font-medium">{u.full_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email ?? "—"}</p>
                      </div>
                      <Badge variant={roleBadge(u.role)} className="gap-1 text-xs">
                        {roleIcon(u.role)} {u.role ?? "student"}
                      </Badge>
                    </div>
                  ))}
                  {users.length === 0 && <p className="px-6 py-8 text-sm text-muted-foreground text-center">No users yet</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Courses</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setTab("courses")}>View all</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {courses.slice(0, 6).map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-6 py-3">
                      <p className="text-sm font-medium line-clamp-1">{c.title}</p>
                      <Badge variant={c.is_published ? "secondary" : "outline"}>
                        {c.is_published ? "Live" : "Draft"}
                      </Badge>
                    </div>
                  ))}
                  {courses.length === 0 && <p className="px-6 py-8 text-sm text-muted-foreground text-center">No courses yet</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === "users" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Role</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Joined</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3 font-medium">{u.full_name ?? "—"}</td>
                      <td className="px-6 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                      <td className="px-6 py-3">
                        <Badge variant={roleBadge(u.role)} className="gap-1 text-xs">
                          {roleIcon(u.role)} {u.role ?? "student"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {u.role !== "instructor" && u.role !== "admin" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              disabled={updatingId === u.id}
                              onClick={() => setRole(u.id, "instructor")}>
                              Make Instructor
                            </Button>
                          )}
                          {u.role === "instructor" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              disabled={updatingId === u.id}
                              onClick={() => setRole(u.id, "student")}>
                              Revoke
                            </Button>
                          )}
                          {u.role !== "admin" && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setConfirmDelete({ type: "user", id: u.id, name: u.full_name ?? u.email ?? "this user" })}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── ANALYTICS ── */}
      {tab === "analytics" && <AnalyticsPanel />}

      {/* ── COURSES ── */}
      {tab === "courses" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setBuilderCourse("new")} className="bg-brand text-brand-foreground hover:bg-brand/90 gap-2">
              <PlusCircle className="h-4 w-4" /> New Course
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-6 py-3 text-left font-medium text-muted-foreground">Title</th>
                      <th className="px-6 py-3 text-left font-medium text-muted-foreground">Category</th>
                      <th className="px-6 py-3 text-left font-medium text-muted-foreground">Price</th>
                      <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3 font-medium max-w-xs">
                          <span className="line-clamp-1">{c.title}</span>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{c.categories?.join(", ") || "—"}</td>
                        <td className="px-6 py-3">${c.price}</td>
                        <td className="px-6 py-3">
                          <Badge variant={c.is_published ? "secondary" : "outline"}>
                            {c.is_published ? "Live" : "Draft"}
                          </Badge>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                              onClick={() => setBuilderCourse(c)}>
                              <Pencil className="h-3 w-3" /> Edit
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                              disabled={updatingId === c.id}
                              onClick={() => togglePublish(c)}>
                              {c.is_published ? <><EyeOff className="h-3 w-3" /> Unpublish</> : <><Eye className="h-3 w-3" /> Publish</>}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setConfirmDelete({ type: "course", id: c.id, name: c.title })}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        No courses yet — <button onClick={() => setBuilderCourse("new")} className="text-brand hover:underline">create your first</button>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
