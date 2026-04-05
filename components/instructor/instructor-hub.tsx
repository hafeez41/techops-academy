"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, PlusCircle, ArrowUpRight } from "lucide-react";
import { AnalyticsPanel } from "@/components/shared/analytics-panel";
import type { Course } from "@/types";

interface Props {
  instructorId: string;
  courses: (Course & { enrollments: { count: number }[]; lessons: { count: number }[] })[];
  totalStudents: number;
  totalCourses: number;
  publishedCourses: number;
  avgCompletionRate: number;
}

type Tab = "overview" | "analytics";

export function InstructorHub({
  instructorId,
  courses,
  totalStudents,
  totalCourses,
  publishedCourses,
  avgCompletionRate,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview",  label: "Overview",  icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="w-full">

      {/* ── Header bar ── */}
      <div className="border-b border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-3 py-4">
              <span className="font-mono text-xs text-brand select-none">~/</span>
              <h1 className="text-sm font-bold tracking-tight">Instructor Hub</h1>
            </div>

            {/* Right: tabs + action */}
            <div className="flex items-stretch gap-0">
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

              <div className="flex items-center pl-4 border-l border-border/50 ml-2">
                <Button asChild className="rounded-lg h-7 text-xs font-mono gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90">
                  <Link href="/instructor/courses/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">new course</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {tab === "overview" && (
        <div className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 divide-x divide-border/60">
              {[
                { label: "Total Courses",   value: totalCourses,        sub: `${publishedCourses} published` },
                { label: "Students",         value: totalStudents,        sub: "across all courses" },
                { label: "Avg Completion",   value: `${avgCompletionRate}%`, sub: "enrolled students" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="py-7 px-6 lg:px-8">
                  <p className="font-mono text-4xl sm:text-5xl font-black tabular-nums tracking-tighter text-foreground leading-none">
                    {value}
                  </p>
                  <p className="mt-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/60 font-mono">{sub}</p>
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
          <>
            {courses.length > 0 ? (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground mb-4">
                  Your Courses
                </p>

                <div className="rounded-lg border border-border/60 overflow-hidden">
                  {courses.map((course, i) => {
                    const lessonCount = course.lessons?.[0]?.count ?? 0;
                    const studentCount = course.enrollments?.[0]?.count ?? 0;

                    return (
                      <Link key={course.id} href={`/instructor/courses/${course.id}`}>
                        <div className={`group flex items-center gap-4 px-5 py-4 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${i % 2 === 1 ? "bg-muted/[0.04]" : ""}`}>

                          {/* Status indicator */}
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${course.is_published ? "bg-emerald-400" : "bg-muted-foreground/30"}`} />

                          {/* Thumbnail */}
                          <div className="h-12 w-20 rounded bg-muted border border-border/40 overflow-hidden shrink-0 hidden sm:block">
                            {course.thumbnail_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-brand transition-colors">
                              {course.title}
                            </p>
                            <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                              {lessonCount} lessons · {studentCount} students
                            </p>
                          </div>

                          {/* Status + arrow */}
                          <div className="flex items-center gap-4 shrink-0">
                            <span className={`font-mono text-[10px] font-black uppercase tracking-wide hidden sm:inline ${course.is_published ? "text-emerald-500" : "text-muted-foreground/50"}`}>
                              {course.is_published ? "live" : "draft"}
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="font-mono text-7xl font-black text-muted-foreground/10 select-none leading-none mb-6">
                  [ ]
                </div>
                <p className="text-lg font-bold tracking-tight">No courses yet</p>
                <p className="text-sm text-muted-foreground mt-1.5 font-mono">
                  Create your first course to get started.
                </p>
                <Button asChild className="mt-6 rounded-lg h-8 text-xs font-mono gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90">
                  <Link href="/instructor/courses/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    create course
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}

        {/* ANALYTICS */}
        {tab === "analytics" && <AnalyticsPanel instructorId={instructorId} />}
      </main>
    </div>
  );
}
