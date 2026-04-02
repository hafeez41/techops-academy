"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, TrendingUp, Eye, EyeOff } from "lucide-react";

interface LessonStat {
  id: string;
  title: string;
  position: number;
  completions: number;
}

interface CourseStat {
  id: string;
  title: string;
  isPublished: boolean;
  instructorName: string | null;
  enrolled: number;
  totalLessons: number;
  completedStudents: number;
  avgProgress: number;
  lessons: LessonStat[];
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums w-8 text-right text-muted-foreground">{Math.round(value)}%</span>
    </div>
  );
}

function lessonBarColor(pct: number) {
  if (pct >= 75) return "bg-green-500";
  if (pct >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

function CourseCard({ course }: { course: CourseStat }) {
  const [expanded, setExpanded] = useState(false);
  const completionRate = course.enrolled > 0 ? (course.completedStudents / course.enrolled) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold line-clamp-1">{course.title}</CardTitle>
            {course.instructorName && (
              <p className="text-xs text-muted-foreground mt-0.5">{course.instructorName}</p>
            )}
          </div>
          <Badge variant={course.isPublished ? "secondary" : "outline"} className="shrink-0 gap-1 text-xs">
            {course.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {course.isPublished ? "Live" : "Draft"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-secondary/50 px-2 py-2.5">
            <p className="text-xl font-bold">{course.enrolled}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Enrolled</p>
          </div>
          <div className="rounded-lg bg-secondary/50 px-2 py-2.5">
            <p className="text-xl font-bold">{Math.round(completionRate)}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
          </div>
          <div className="rounded-lg bg-secondary/50 px-2 py-2.5">
            <p className="text-xl font-bold">{Math.round(course.avgProgress)}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg progress</p>
          </div>
        </div>

        {/* Lesson funnel */}
        {course.lessons.length > 0 && (
          <div>
            <button
              className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
              onClick={() => setExpanded((v) => !v)}
            >
              <span>Lesson completion funnel</span>
              <span>{expanded ? "Hide" : "Show"} ({course.lessons.length} lessons)</span>
            </button>

            {expanded && (
              <div className="space-y-2 mt-2">
                {course.lessons.map((lesson) => {
                  const pct = course.enrolled > 0 ? (lesson.completions / course.enrolled) * 100 : 0;
                  return (
                    <div key={lesson.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground truncate max-w-[200px]">
                          {lesson.position}. {lesson.title}
                        </span>
                        <span className="text-muted-foreground tabular-nums ml-2 shrink-0">
                          {lesson.completions}/{course.enrolled}
                        </span>
                      </div>
                      <ProgressBar value={pct} color={lessonBarColor(pct)} />
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground pt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />≥75%
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mx-1 ml-3" />40–75%
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 mx-1 ml-3" />&lt;40%
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface Props {
  /** Filter to a specific instructor. Omit to show all courses (admin view). */
  instructorId?: string;
}

export function AnalyticsPanel({ instructorId }: Props) {
  const [courses, setCourses] = useState<CourseStat[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      // 1. Fetch courses with lessons + instructor profile
      let q = supabase
        .from("courses")
        .select("id, title, is_published, instructor_id, profiles(full_name), lessons(id, title, position)")
        .order("created_at", { ascending: false });

      if (instructorId) q = q.eq("instructor_id", instructorId);

      const { data: rawCourses } = await q;
      if (!rawCourses || rawCourses.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      const courseIds = rawCourses.map((c: { id: string }) => c.id);

      // 2. Fetch enrollments + progress in parallel
      const [{ data: enrollments }, { data: progressData }] = await Promise.all([
        supabase.from("enrollments").select("course_id, student_id").in("course_id", courseIds),
        supabase.from("progress").select("lesson_id, course_id, student_id").in("course_id", courseIds),
      ]);

      // 3. Build per-course stats
      const stats: CourseStat[] = (rawCourses as unknown as Array<{
        id: string;
        title: string;
        is_published: boolean;
        instructor_id: string;
        profiles: { full_name: string | null } | null;
        lessons: { id: string; title: string; position: number }[];
      }>).map((c) => {
        const courseEnrollments = (enrollments ?? []).filter((e) => e.course_id === c.id);
        const enrolled = courseEnrollments.length;
        const enrolledStudentIds = new Set(courseEnrollments.map((e) => e.student_id));

        const courseProgress = (progressData ?? []).filter((p) => p.course_id === c.id);
        const sortedLessons = [...(c.lessons ?? [])].sort((a, b) => a.position - b.position);
        const totalLessons = sortedLessons.length;

        // Per-lesson completion counts
        const lessonCompletions = new Map<string, number>();
        for (const p of courseProgress) {
          lessonCompletions.set(p.lesson_id, (lessonCompletions.get(p.lesson_id) ?? 0) + 1);
        }

        // Per-student progress (for avgProgress)
        const progressByStudent = new Map<string, Set<string>>();
        for (const p of courseProgress) {
          if (!progressByStudent.has(p.student_id)) progressByStudent.set(p.student_id, new Set());
          progressByStudent.get(p.student_id)!.add(p.lesson_id);
        }

        // Completed students (done all lessons)
        let completedStudents = 0;
        let totalPctSum = 0;
        for (const studentId of Array.from(enrolledStudentIds)) {
          const done = progressByStudent.get(studentId)?.size ?? 0;
          const pct = totalLessons > 0 ? done / totalLessons : 0;
          totalPctSum += pct;
          if (pct >= 1) completedStudents++;
        }

        const avgProgress = enrolled > 0 ? (totalPctSum / enrolled) * 100 : 0;

        return {
          id: c.id,
          title: c.title,
          isPublished: c.is_published,
          instructorName: instructorId ? null : (c.profiles?.full_name ?? null),
          enrolled,
          totalLessons,
          completedStudents,
          avgProgress,
          lessons: sortedLessons.map((l) => ({
            id: l.id,
            title: l.title,
            position: l.position,
            completions: lessonCompletions.get(l.id) ?? 0,
          })),
        };
      });

      setCourses(stats);
      setLoading(false);
    }

    load();
  }, [instructorId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Summary totals
  const totalEnrolled = courses.reduce((s, c) => s + c.enrolled, 0);
  const totalCompleted = courses.reduce((s, c) => s + c.completedStudents, 0);
  const overallCompletionRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-secondary/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="font-medium">No analytics yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          {instructorId ? "Create and publish a course to see analytics." : "No courses found."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full p-2.5 bg-blue-500/10">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full p-2.5 bg-green-500/10">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total enrolled</p>
              <p className="text-2xl font-bold">{totalEnrolled}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full p-2.5 bg-brand/10">
              <TrendingUp className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion rate</p>
              <p className="text-2xl font-bold">{overallCompletionRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-course cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
