"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, TrendingUp, Eye, EyeOff, Shield,
  GraduationCap, UserCheck, PlusCircle, Pencil, Trash2,
  AlertTriangle, BarChart3,
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

type Tab = "overview" | "users" | "courses" | "analytics";

export function AdminDashboard({
  stats: initialStats,
  recentUsers: initialUsers,
  courses: initialCourses,
}: {
  stats: Stats;
  recentUsers: Profile[];
  courses: Course[];
  adminId?: string; // kept in prop signature for future use
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "course" | "user"; id: string; name: string } | null>(null);


  const togglePublish = async (course: Course) => {
    setUpdatingId(course.id);
    await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course.id, is_published: !course.is_published }),
    });
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

  const setRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    setUsers((p) => p.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    setUpdatingId(null);
  };

  const deleteUser = async (id: string) => {
    setDeletingId(id);
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    setUsers((p) => p.filter((u) => u.id !== id));
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const roleBadge = (role: string | null) => {
    if (role === "admin") return (
      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wide">
        <Shield className="h-2.5 w-2.5" />admin
      </span>
    );
    if (role === "instructor") return (
      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wide">
        <GraduationCap className="h-2.5 w-2.5" />instructor
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold bg-muted text-muted-foreground border border-border uppercase tracking-wide">
        <UserCheck className="h-2.5 w-2.5" />student
      </span>
    );
  };

  const ConfirmDialog = () => {
    if (!confirmDelete) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="rounded-xl border border-destructive/20 shadow-2xl p-7 max-w-sm w-full mx-4"
          style={{ backgroundColor: "hsl(224,25%,6%)" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <h3 className="font-bold text-base text-white">Delete {confirmDelete.type}?</h3>
          <p className="mt-1.5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            <span className="font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>&ldquo;{confirmDelete.name}&rdquo;</span>{" "}
            will be permanently deleted.{" "}
          </p>
          <div className="mt-5 flex gap-2 justify-end">
            <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs border-white/10 text-white/60 hover:bg-white/5" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" className="rounded-lg h-8 text-xs"
              disabled={deletingId === confirmDelete.id}
              onClick={() => confirmDelete.type === "course" ? deleteCourse(confirmDelete.id) : deleteUser(confirmDelete.id)}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview",   label: "Overview",   icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: "users",      label: "Users",      icon: <Users className="h-3.5 w-3.5" /> },
    { id: "courses",    label: "Courses",    icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: "analytics",  label: "Analytics",  icon: <TrendingUp className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="w-full">
      <ConfirmDialog />

      {/* ── Header bar ── */}
      <div className="border-b border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: title */}
            <div className="flex items-center gap-3 py-4">
              <span className="font-mono text-xs text-brand select-none">sys://</span>
              <h1 className="text-sm font-bold tracking-tight">Admin Dashboard</h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wide bg-red-500/10 text-red-400 border border-red-500/20">
                <Shield className="h-2.5 w-2.5" /> root
              </span>
            </div>

            {/* Right: tab nav */}
            <nav className="flex items-stretch">
              {TABS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-4 h-[57px] text-xs font-semibold border-b-2 transition-all ${
                    tab === id
                      ? "border-brand text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* ── Stats strip (overview only) ── */}
      {tab === "overview" && (
        <div className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 divide-x divide-border/60">
              {[
                { label: "Total Users",    value: initialStats.totalUsers,       suffix: "" },
                { label: "Courses",        value: courses.length,                suffix: "" },
                { label: "Enrollments",    value: initialStats.totalEnrollments, suffix: "" },
              ].map(({ label, value, suffix }) => (
                <div key={label} className="py-7 px-6 lg:px-8">
                  <p className="font-mono text-4xl sm:text-5xl font-black tabular-nums tracking-tighter text-foreground leading-none">
                    {value.toLocaleString()}{suffix}
                  </p>
                  <p className="mt-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Page body ── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent Users */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recent Users</p>
                <button onClick={() => setTab("users")} className="text-[11px] font-semibold text-brand hover:underline underline-offset-2">
                  view all →
                </button>
              </div>
              <div className="rounded-lg border border-border/60 overflow-hidden">
                {users.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-muted-foreground text-center">No users yet</p>
                ) : (
                  users.slice(0, 6).map((u, i) => (
                    <div key={u.id}
                      className={`flex items-center justify-between px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.full_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground truncate font-mono">{u.email ?? "—"}</p>
                      </div>
                      {roleBadge(u.role)}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Courses */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Courses</p>
                <button onClick={() => setTab("courses")} className="text-[11px] font-semibold text-brand hover:underline underline-offset-2">
                  view all →
                </button>
              </div>
              <div className="rounded-lg border border-border/60 overflow-hidden">
                {courses.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-muted-foreground text-center">No courses yet</p>
                ) : (
                  courses.slice(0, 6).map((c, i) => (
                    <div key={c.id}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                      {/* Status dot */}
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${c.is_published ? "bg-emerald-400" : "bg-muted-foreground/40"}`} />
                      <p className="text-sm font-medium flex-1 truncate">{c.title}</p>
                      <span className={`font-mono text-[10px] font-bold uppercase tracking-wide shrink-0 ${c.is_published ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {c.is_published ? "live" : "draft"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "hsl(224,28%,5%)" }}>
                    <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-white/35">Name</th>
                    <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-white/35">Email</th>
                    <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-white/35">Role</th>
                    <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-white/35">Joined</th>
                    <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-white/35">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={`border-b border-border/40 last:border-0 group hover:bg-brand/[0.03] transition-colors ${i % 2 === 1 ? "bg-muted/[0.04]" : ""}`}>
                      <td className="px-5 py-3 font-medium">{u.full_name ?? "—"}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{u.email ?? "—"}</td>
                      <td className="px-5 py-3">{roleBadge(u.role)}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {u.role !== "instructor" && u.role !== "admin" && (
                            <Button size="sm" variant="outline" className="h-6 text-[11px] rounded px-2 font-mono"
                              disabled={updatingId === u.id} onClick={() => setRole(u.id, "instructor")}>
                              → instructor
                            </Button>
                          )}
                          {u.role === "instructor" && (
                            <Button size="sm" variant="outline" className="h-6 text-[11px] rounded px-2 font-mono"
                              disabled={updatingId === u.id} onClick={() => setRole(u.id, "student")}>
                              revoke
                            </Button>
                          )}
                          {u.role !== "admin" && (
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setConfirmDelete({ type: "user", id: u.id, name: u.full_name ?? u.email ?? "this user" })}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COURSES */}
        {tab === "courses" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button asChild className="rounded-lg h-8 text-xs font-mono gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90">
                <Link href="/instructor/courses/new">
                  <PlusCircle className="h-3.5 w-3.5" /> new course
                </Link>
              </Button>
            </div>

            <div className="rounded-lg border border-border/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "hsl(224,28%,5%)" }}>
                      <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-white/35">Title</th>
                      <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-white/35">Category</th>
                      <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-white/35">Price</th>
                      <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-white/35">Status</th>
                      <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-white/35">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c, i) => (
                      <tr key={c.id} className={`border-b border-border/40 last:border-0 group hover:bg-brand/[0.03] transition-colors ${i % 2 === 1 ? "bg-muted/[0.04]" : ""}`}>
                        <td className="px-5 py-3 font-medium max-w-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${c.is_published ? "bg-emerald-400" : "bg-muted-foreground/30"}`} />
                            <span className="truncate">{c.title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{c.categories?.join(", ") || "—"}</td>
                        <td className="px-5 py-3 font-mono font-semibold">${c.price}</td>
                        <td className="px-5 py-3">
                          <span className={`font-mono text-[10px] font-black uppercase tracking-wide ${c.is_published ? "text-emerald-500" : "text-muted-foreground"}`}>
                            {c.is_published ? "● live" : "○ draft"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="outline" className="h-6 text-[11px] rounded px-2 font-mono gap-1" asChild>
                              <Link href={`/instructor/courses/${c.id}`}><Pencil className="h-2.5 w-2.5" />edit</Link>
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 text-[11px] rounded px-2 font-mono gap-1"
                              disabled={updatingId === c.id} onClick={() => togglePublish(c)}>
                              {c.is_published ? <><EyeOff className="h-2.5 w-2.5" />unpublish</> : <><Eye className="h-2.5 w-2.5" />publish</>}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setConfirmDelete({ type: "course", id: c.id, name: c.title })}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">
                          No courses —{" "}
                          <Link href="/instructor/courses/new" className="text-brand hover:underline underline-offset-2">create one</Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {tab === "analytics" && <AnalyticsPanel />}
      </main>
    </div>
  );
}
