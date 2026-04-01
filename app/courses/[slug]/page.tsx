import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import { EnrollButton } from "@/components/shared/enroll-button";
import { ReviewForm } from "@/components/shared/review-form";
import type { Lesson } from "@/types";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from("courses")
    .select("title, description")
    .eq("slug", params.slug)
    .single();
  return { title: data?.title ?? "Course" };
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatLessonDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: course }, { data: profile }] = await Promise.all([
    supabase
      .from("courses")
      .select(`*, profiles(*), lessons(*), reviews(*, profiles(*))`)
      .eq("slug", params.slug)
      .eq("is_published", true)
      .single(),
    user
      ? supabase.from("profiles").select("role").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  if (!course) notFound();

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
  const instructorInitials = instructorName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const firstLesson = lessons[0];

  const ctaCard = (
    <Card className="shadow-xl overflow-hidden">
      <CardContent className="p-0">
        {course.thumbnail_url ? (
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="rounded-full bg-white/90 p-3.5 shadow-lg">
                <Play className="h-6 w-6 fill-zinc-900 text-zinc-900" />
              </div>
            </div>
          </div>
        ) : null}
        <div className="p-6 space-y-4">
          <div className="text-3xl font-bold">
            {course.price === 0 ? "Free" : `$${course.price}`}
          </div>

          {isEnrolled ? (
            <Button className="w-full h-11 text-base" asChild>
              <Link href={firstLesson ? `/learn/${course.id}/${firstLesson.id}` : "#"}>
                <Play className="mr-2 h-4 w-4" />
                Continue Learning
              </Link>
            </Button>
          ) : (
            <EnrollButton courseId={course.id} userId={user?.id ?? null} price={course.price ?? 0} firstLessonId={firstLesson?.id ?? null} />
          )}

          <Separator />

          <div>
            <p className="text-sm font-semibold mb-3">This course includes:</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {durationLabel && (
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-foreground" />
                  {durationLabel} of on-demand video
                </li>
              )}
              <li className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 shrink-0 text-foreground" />
                {lessons.length} lessons
              </li>
              <li className="flex items-center gap-2.5">
                <Infinity className="h-4 w-4 shrink-0 text-foreground" />
                Full lifetime access
              </li>
              <li className="flex items-center gap-2.5">
                <Award className="h-4 w-4 shrink-0 text-foreground" />
                Certificate of completion
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Dark hero */}
      <div className="bg-zinc-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left: course info */}
            <div className="lg:col-span-2 space-y-4">
              {course.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {course.categories.map((cat: string) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="text-3xl font-bold tracking-tight leading-tight">
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
                <Avatar className="h-7 w-7 border border-zinc-600">
                  <AvatarImage src={course.profiles?.avatar_url ?? ""} />
                  <AvatarFallback className="text-xs bg-zinc-700 text-zinc-200">
                    {instructorInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-zinc-300">
                  Created by{" "}
                  <span className="text-brand font-medium underline underline-offset-2">
                    {instructorName}
                  </span>
                </span>
              </div>
            </div>

            {/* Right: CTA card (desktop only) */}
            <div className="hidden lg:block">
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Course content</h2>
                <span className="text-sm text-muted-foreground">
                  {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                  {durationLabel ? ` • ${durationLabel}` : ""}
                </span>
              </div>
              <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
                {lessons.map((lesson, idx) => {
                  const canAccess = isEnrolled || lesson.is_free_preview;
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/40 transition-colors"
                    >
                      <span className="shrink-0 w-4 text-center text-xs text-muted-foreground">
                        {idx + 1}
                      </span>

                      {canAccess ? (
                        <Link
                          href={`/learn/${course.id}/${lesson.id}`}
                          className="flex flex-1 items-center gap-3 min-w-0 hover:text-brand transition-colors"
                        >
                          <span className="shrink-0">
                            <Play className="h-4 w-4 text-brand" />
                          </span>
                          <span className="flex-1 truncate">{lesson.title}</span>
                        </Link>
                      ) : (
                        <>
                          <span className="shrink-0">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </span>
                          <span className="flex-1 truncate text-muted-foreground">
                            {lesson.title}
                          </span>
                        </>
                      )}

                      <div className="flex items-center gap-2 shrink-0">
                        {lesson.is_free_preview && !isEnrolled && (
                          <Badge
                            variant="outline"
                            className="text-xs border-brand/40 text-brand py-0"
                          >
                            Preview
                          </Badge>
                        )}
                        {lesson.duration_seconds ? (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {formatLessonDuration(lesson.duration_seconds)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructor section */}
            <div>
              <h2 className="text-xl font-bold mb-4">Instructor</h2>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 shrink-0">
                  <AvatarImage src={course.profiles?.avatar_url ?? ""} />
                  <AvatarFallback className="text-lg bg-brand text-brand-foreground font-semibold">
                    {instructorInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-base">{instructorName}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Course Instructor</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    {avgRating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{avgRating.toFixed(1)} instructor rating</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{(enrollmentCount ?? 0).toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>1 course</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review form — enrolled users who haven't reviewed yet (or want to update) */}
            {isEnrolled && user && (
              <div className="rounded-lg border border-border p-5">
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
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold">Student reviews</h2>
                  {avgRating && (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{avgRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">course rating</span>
                    </div>
                  )}
                </div>
                <div className="space-y-5">
                  {course.reviews
                    .slice(0, 5)
                    .map(
                      (review: {
                        id: string;
                        rating: number;
                        body: string | null;
                        created_at: string;
                        profiles: { full_name: string | null; avatar_url: string | null };
                      }) => (
                        <div key={review.id} className="flex gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={review.profiles?.avatar_url ?? ""} />
                            <AvatarFallback className="text-xs">
                              {review.profiles?.full_name?.charAt(0) ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {review.profiles?.full_name}
                              </span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.body && (
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {review.body}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
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
