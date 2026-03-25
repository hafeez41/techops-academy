"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  TrendingUp,
  Eye,
  EyeOff,
  Shield,
  GraduationCap,
  UserCheck,
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  price: number;
  category: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
}

export function AdminDashboard({
  stats,
  recentUsers,
  courses,
}: {
  stats: Stats;
  recentUsers: Profile[];
  courses: Course[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<"overview" | "users" | "courses">("overview");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const togglePublish = async (courseId: string, current: boolean) => {
    setUpdatingId(courseId);
    await supabase
      .from("courses")
      .update({ is_published: !current })
      .eq("id", courseId);
    router.refresh();
    setUpdatingId(null);
  };

  const setRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    router.refresh();
    setUpdatingId(null);
  };

  const roleIcon = (role: string | null) => {
    if (role === "admin") return <Shield className="h-3.5 w-3.5 text-red-500" />;
    if (role === "instructor") return <GraduationCap className="h-3.5 w-3.5 text-blue-500" />;
    return <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const roleBadgeVariant = (role: string | null): "destructive" | "secondary" | "outline" => {
    if (role === "admin") return "destructive";
    if (role === "instructor") return "secondary";
    return "outline";
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage users, courses, and site settings</p>
        </div>
        <Badge variant="destructive" className="gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Admin
        </Badge>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {(["overview", "users", "courses"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-green-500/10 p-3">
                  <BookOpen className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">{stats.totalCourses}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-brand/10 p-3">
                  <TrendingUp className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrollments</p>
                  <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent signups */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Signups</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentUsers.slice(0, 8).map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <p className="text-sm font-medium">{u.full_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email ?? "—"}</p>
                      </div>
                      <Badge variant={roleBadgeVariant(u.role)} className="gap-1 text-xs">
                        {roleIcon(u.role)}
                        {u.role ?? "student"}
                      </Badge>
                    </div>
                  ))}
                  {recentUsers.length === 0 && (
                    <p className="px-6 py-8 text-sm text-muted-foreground text-center">No users yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Courses</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {courses.slice(0, 8).map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{c.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.profiles?.full_name ?? "Unknown"} · ${c.price}
                        </p>
                      </div>
                      <Badge variant={c.is_published ? "secondary" : "outline"} className="shrink-0">
                        {c.is_published ? "Live" : "Draft"}
                      </Badge>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <p className="px-6 py-8 text-sm text-muted-foreground text-center">No courses yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Users */}
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
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3 font-medium">{u.full_name ?? "—"}</td>
                      <td className="px-6 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                      <td className="px-6 py-3">
                        <Badge variant={roleBadgeVariant(u.role)} className="gap-1 text-xs">
                          {roleIcon(u.role)}
                          {u.role ?? "student"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {u.role !== "instructor" && u.role !== "admin" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              disabled={updatingId === u.id}
                              onClick={() => setRole(u.id, "instructor")}
                            >
                              Make Instructor
                            </Button>
                          )}
                          {u.role === "instructor" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              disabled={updatingId === u.id}
                              onClick={() => setRole(u.id, "student")}
                            >
                              Revoke Instructor
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        No users yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses */}
      {tab === "courses" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Title</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Instructor</th>
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
                      <td className="px-6 py-3 text-muted-foreground">
                        {c.profiles?.full_name ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{c.category ?? "—"}</td>
                      <td className="px-6 py-3">${c.price}</td>
                      <td className="px-6 py-3">
                        <Badge variant={c.is_published ? "secondary" : "outline"}>
                          {c.is_published ? "Live" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5"
                          disabled={updatingId === c.id}
                          onClick={() => togglePublish(c.id, c.is_published)}
                        >
                          {c.is_published ? (
                            <><EyeOff className="h-3 w-3" /> Unpublish</>
                          ) : (
                            <><Eye className="h-3 w-3" /> Publish</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No courses yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
