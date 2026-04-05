import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Play,
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  Infinity,
  CheckCircle,
  AlertCircle,
  Layers,
} from "lucide-react";
import { EnrollButton } from "@/components/shared/enroll-button";
import { ReviewForm } from "@/components/shared/review-form";
import type { Lesson } from "@/types";
import { formatDuration, formatLessonDuration, initials } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const supabase = createClient();
  const { data } = await supabase
    .from("courses")
    .select("title, description")
    .eq("slug", slug)
    .single();
  return { title: data?.title ?? "Course" };
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: course }, { data: profile }] = await Promise.all([
    supabase
      .from("courses")
      .select(`*, profiles(*), lessons(*), reviews(*, profiles(*))`)
      .eq("slug", slug)
      .eq("is_published", true)
      .single(),
    user
      ? supabase.from("profiles").select("role").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  if (!course) notFound();

  // Fetch sections + prerequisites in parallel — both depend only on course.id
  const [{ data: sectionsRaw }, { data: prereqRows }] = await Promise.all([
    supabase
      .from("course_sections")
      .select("id, title, position")
      .eq("course_id", course.id)
      .order("position"),
    supabase
      .from("course_prerequisites")
      .select("prerequisite_id, courses!course_prerequisites_prerequisite_id_fkey(id, title, slug)")
      .eq("course_id", course.id),
  ]);
  const sections = sectionsRaw ?? [];
  const prerequisites: { id: string; title: string; slug: string }[] =
    (prereqRows ?? []).flatMap((r: { prerequisite_id: string; courses: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null }) => {
      const c = r.courses;
      if (!c) return [];
      if (Array.isArray(c)) return c;
      return [c];
    });

  // Check which prerequisites the user has completed
  let completedPrereqIds = new Set<string>();
  if (user && prerequisites.length > 0) {
    const prereqCourseIds = prerequisites.map((p) => p.id);
    const { data: completions } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", user.id)
      .in("course_id", prereqCourseIds);
    // A prerequisite is "met" if enrolled — full completion check is done at enroll time
    completedPrereqIds = new Set((completions ?? []).map((c) => c.course_id));
  }

  const isAdmin = profile?.role === "admin";

  let isEnrolled = isAdmin;
  let enrollmentCount: number | null = null;

  if (user && !isAdmin) {
    const [{ data: enrollment }, { count }] = await Promise.all([
      supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", user.id)
        .eq("course_id", course.id)
        .single(),
      supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("course_id", course.id),
    ]);
    isEnrolled = !!enrollment;
    enrollmentCount = count;
  } else {
    const { count } = await supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("course_id", course.id);
    enrollmentCount = count;
  }

  const lessons: Lesson[] = (course.lessons ?? []).sort(
    (a: Lesson, b: Lesson) => a.position - b.position
  );

  const totalSeconds = lessons.reduce(
    (acc: number, l: Lesson) => acc + (l.duration_seconds ?? 0),
    0
  );
  const durationLabel = totalSeconds > 0 ? formatDuration(totalSeconds) : null;

  const avgRating =
    course.reviews?.length > 0
      ? course.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) /
        course.reviews.length
      : null;

  const instructorName = course.profiles?.full_name ?? "Instructor";
  const instructorInitials = initials(instructorName);

  const firstLesson = lessons[0];

  const ctaCard = (
    <div className="rounded-2xl border border-white/10 bg-[hsl(224,20%,8%)] shadow-2xl shadow-black/40 overflow-hidden">
      {course.thumbnail_url ? (
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="rounded-full bg-white/95 p-4 shadow-xl ring-4 ring-white/20 transition-transform hover:scale-105">
              <Play className="h-6 w-6 fill-zinc-950 text-zinc-950" />
            </div>
          </div>
        </div>
      ) : null}
      <div className="p-6 space-y-4">
        <div className={`text-4xl font-black tracking-tight ${course.price === 0 ? "text-amber-400" : "text-white"}`}>
          {course.price === 0 ? "Free" : `$${course.price}`}
        </div>

        {/* Prerequisites */}
        {prerequisites.length > 0 && !isEnrolled && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wide flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Prerequisites required
            </p>
            <ul className="space-y-1.5">
              {prerequisites.map((p) => {
                const done = completedPrereqIds.has(p.id);
                return (
                  <li key={p.id} className="flex items-center gap-2 text-sm">
                    {done ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-white/30 shrink-0" />
                    )}
                    <Link
                      href={`/courses/${p.slug}`}
                      className="text-white/60 hover:text-white hover:underline underline-offset-2 transition-colors truncate"
                    >
                      {p.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {isEnrolled ? (
          <Button className="h-12 text-base font-black rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 shadow-md shadow-brand/20 w-full" asChild>
            <Link href={firstLesson ? `/learn/${course.id}/${firstLesson.id}` : "#"}>
              <Play className="mr-2 h-4 w-4" />
              Continue Learning
            </Link>
          </Button>
        ) : (
          <EnrollButton courseId={course.id} userId={user?.id ?? null} price={course.price ?? 0} firstLessonId={firstLesson?.id ?? null} />
        )}

        <div className="h-px bg-white/10" />

        <div>
          <p className="text-sm font-semibold mb-3 text-white/70">This course includes:</p>
          <ul className="space-y-2.5 text-sm text-white/50">
            {durationLabel && (
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0" style={{ color: "#f59e0b" }} />
                {durationLabel} of on-demand video
              </li>
            )}
            <li className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 shrink-0" style={{ color: "#f59e0b" }} />
              {lessons.length} lessons
            </li>
            <li className="flex items-center gap-2.5">
              <Infinity className="h-4 w-4 shrink-0" style={{ color: "#f59e0b" }} />
              Full lifetime access
            </li>
            <li className="flex items-center gap-2.5">
              <Award className="h-4 w-4 shrink-0" style={{ color: "#f59e0b" }} />
              Certificate of completion
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Dark hero */}
      <div className="relative overflow-hidden bg-zinc-900 text-white">
        {/* Radial brand glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--brand)/0.12),transparent_60%)]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.08]" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left: course info */}
            <div className="lg:col-span-2 space-y-4">
              {course.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {course.categories.map((cat: string) => (
                    <span
                      key={cat}
                      className="font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-white/15 text-white/60 bg-white/5"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter leading-tight">
                {course.title}
              </h1>

              {course.description && (
                <p className="text-zinc-300 leading-relaxed text-base max-w-2xl">
                  {course.description}
                </p>
              )}

              {/* Rating row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {avgRating && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-yellow-400">{avgRating.toFixed(1)}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.round(avgRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-zinc-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-zinc-400">
                      ({course.reviews?.length} rating{course.reviews?.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Users className="h-4 w-4" />
                  <span>{(enrollmentCount ?? 0).toLocaleString()} students</span>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {lessons.length} lessons
                </div>
                {durationLabel && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {durationLabel} total length
                  </div>
                )}
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-2.5 pt-1">
                <div className="h-7 w-7 shrink-0 rounded bg-brand/20 border border-brand/30 flex items-center justify-center font-mono text-[9px] font-black text-brand">
                  {instructorInitials}
                </div>
                <span className="text-sm text-zinc-400">
                  by{" "}
                  <span className="text-brand font-medium">{instructorName}</span>
                </span>
              </div>
            </div>

            {/* Right: CTA card (desktop only) — sticky */}
            <div className="hidden lg:block lg:sticky lg:top-6">
              {ctaCard}
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mobile CTA card */}
            <div className="lg:hidden">{ctaCard}</div>

            {/* Curriculum */}
            <div>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/40">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                  course.content
                </span>
                <span className="font-mono text-[9px] text-muted-foreground/25 ml-auto tabular-nums">
                  {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                  {durationLabel ? ` · ${durationLabel}` : ""}
                </span>
              </div>
              <div className="border border-border/40 rounded-lg overflow-hidden">
                {(() => {
                  // Group lessons by section
                  const groups: { title: string | null; lessons: typeof lessons }[] = [];
                  if (sections.length > 0) {
                    const unsectioned = lessons.filter((l) => !l.section_id);
                    sections.forEach((s) => {
                      const sLessons = lessons.filter((l) => l.section_id === s.id);
                      if (sLessons.length > 0) groups.push({ title: s.title, lessons: sLessons });
                    });
                    if (unsectioned.length > 0) groups.push({ title: null, lessons: unsectioned });
                  } else {
                    groups.push({ title: null, lessons });
                  }

                  let globalIdx = 0;
                  return groups.map((group, gi) => (
                    <div key={gi}>
                      {group.title && (
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/20 border-b border-border/30">
                          <Layers className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            {group.title}
                          </p>
                        </div>
                      )}
                      {group.lessons.map((lesson) => {
                        const idx = globalIdx++;
                        const canAccess = isEnrolled || lesson.is_free_preview;
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 py-3 px-4 hover:bg-muted/30 transition-colors border-b border-border/20 last:border-0"
                          >
                            <span className="font-mono text-[10px] font-bold text-muted-foreground/30 w-5 text-right shrink-0 tabular-nums">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            {canAccess ? (
                              <Link
                                href={`/learn/${course.id}/${lesson.id}`}
                                className="group/row flex flex-1 items-center gap-2.5 min-w-0"
                              >
                                <Play className="h-3 w-3 shrink-0 text-muted-foreground/30 group-hover/row:text-brand transition-colors" />
                                <span className="flex-1 truncate text-sm text-foreground/80 group-hover/row:text-brand transition-colors">
                                  {lesson.title}
                                </span>
                              </Link>
                            ) : (
                              <div className="flex flex-1 items-center gap-2.5 min-w-0">
                                <Lock className="h-3 w-3 shrink-0 text-muted-foreground/20" />
                                <span className="flex-1 truncate text-sm text-muted-foreground/40">
                                  {lesson.title}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                              {lesson.is_free_preview && !isEnrolled && (
                                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-brand/70 border border-brand/20 px-1.5 py-0.5 rounded">
                                  preview
                                </span>
                              )}
                              {lesson.duration_seconds ? (
                                <span className="font-mono text-[10px] tabular-nums text-muted-foreground/40">
                                  {formatLessonDuration(lesson.duration_seconds)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Instructor section */}
            <div className="border-t border-border/40 pt-8">
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-5">instructor</p>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center font-mono text-sm font-black text-brand">
                  {instructorInitials}
                </div>
                <div>
                  <p className="font-bold text-base leading-tight">{instructorName}</p>
                  <p className="font-mono text-[10px] text-brand/70 mt-0.5 uppercase tracking-widest">Course Instructor</p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 font-mono text-[11px] text-muted-foreground/60">
                    {avgRating && (
                      <span className="flex items-center gap-1 tabular-nums">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {avgRating.toFixed(1)} avg
                      </span>
                    )}
                    <span className="tabular-nums">{(enrollmentCount ?? 0).toLocaleString()} students</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review form */}
            {isEnrolled && user && (
              <div className="border-t border-border/40 pt-8">
                <ReviewForm
                  courseId={course.id}
                  existingReview={
                    course.reviews?.find((r: { student_id: string; rating: number; body: string | null }) => r.student_id === user.id)
                      ? {
                          rating: course.reviews.find((r: { student_id: string; rating: number; body: string | null }) => r.student_id === user.id)!.rating,
                          body: course.reviews.find((r: { student_id: string }) => r.student_id === user.id)!.body,
                        }
                      : null
                  }
                />
              </div>
            )}

            {/* Reviews */}
            {course.reviews?.length > 0 && (
              <div className="border-t border-border/40 pt-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    reviews
                  </span>
                  {avgRating && (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-mono text-[11px] font-bold text-yellow-500 tabular-nums">{avgRating.toFixed(1)}</span>
                      <span className="font-mono text-[9px] text-muted-foreground/40 tabular-nums">[{course.reviews.length}]</span>
                    </div>
                  )}
                </div>
                <div>
                  {course.reviews
                    .slice(0, 5)
                    .map((review: {
                      id: string; rating: number; body: string | null;
                      created_at: string;
                      profiles: { full_name: string | null; avatar_url: string | null };
                    }) => {
                      const rname = review.profiles?.full_name ?? "Student";
                      const rini = rname.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                      return (
                        <div key={review.id} className="flex gap-3 py-4 border-b border-border/30 last:border-0">
                          <div className="h-6 w-6 shrink-0 mt-0.5 rounded bg-brand/10 border border-brand/20 flex items-center justify-center font-mono text-[8px] font-black text-brand">
                            {rini}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-mono text-[11px] font-bold text-foreground/80">{rname}</span>
                              <div className="flex gap-px">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-2.5 w-2.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />
                                ))}
                              </div>
                            </div>
                            {review.body && (
                              <p className="text-sm text-muted-foreground/80 leading-relaxed">{review.body}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Desktop sticky sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">{ctaCard}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
