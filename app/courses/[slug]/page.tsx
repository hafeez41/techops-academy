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
import { Lock, Play, Star, Users, Clock, BookOpen } from "lucide-react";
import { EnrollButton } from "@/components/shared/enroll-button";
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

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("courses")
    .select(`*, profiles(*), lessons(*), reviews(*, profiles(*))`)
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!course) notFound();

  // Check enrollment
  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", course.id)
      .single();
    isEnrolled = !!enrollment;
  }

  const { count: enrollmentCount } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("course_id", course.id);

  const lessons: Lesson[] = (course.lessons ?? []).sort(
    (a: Lesson, b: Lesson) => a.position - b.position
  );

  const totalMinutes = lessons.reduce(
    (acc: number, l: Lesson) => acc + (l.duration_seconds ?? 0) / 60,
    0
  );

  const avgRating =
    course.reviews?.length > 0
      ? (
          course.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) /
          course.reviews.length
        ).toFixed(1)
      : null;

  const instructorName = course.profiles?.full_name ?? "Instructor";
  const instructorInitials = instructorName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const firstLesson = lessons[0];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left — course details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              {course.category && (
                <Badge variant="outline" className="mb-3">
                  {course.category}
                </Badge>
              )}
              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              {course.description && (
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {avgRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="font-medium text-foreground">{avgRating}</span>
                    <span>({course.reviews?.length} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{enrollmentCount ?? 0} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {lessons.length} lessons
                </div>
                {totalMinutes > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.round(totalMinutes)} min
                  </div>
                )}
              </div>
            </div>

            {/* Instructor */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Instructor</h2>
              <Link href={`/instructors/${course.instructor_id}`} className="flex items-center gap-3 group">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={course.profiles?.avatar_url ?? ""} />
                  <AvatarFallback>{instructorInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium group-hover:underline">{instructorName}</p>
                  {course.profiles?.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{course.profiles.bio}</p>
                  )}
                </div>
              </Link>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Curriculum</h2>
              <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
                {lessons.map((lesson, idx) => {
                  const canAccess = isEnrolled || lesson.is_free_preview;
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 text-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-muted-foreground w-5 shrink-0">{idx + 1}</span>
                        <span className={`truncate ${!canAccess ? "text-muted-foreground" : ""}`}>
                          {lesson.title}
                        </span>
                        {lesson.is_free_preview && !isEnrolled && (
                          <Badge variant="outline" className="text-xs shrink-0">Preview</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {lesson.duration_seconds && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round(lesson.duration_seconds / 60)}m
                          </span>
                        )}
                        {canAccess ? (
                          isEnrolled ? (
                            <Link href={`/learn/${course.id}/${lesson.id}`}>
                              <Play className="h-4 w-4" />
                            </Link>
                          ) : (
                            <Play className="h-4 w-4 text-muted-foreground" />
                          )
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews */}
            {course.reviews?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Reviews</h2>
                <div className="space-y-4">
                  {course.reviews.slice(0, 5).map((review: { id: string; rating: number; body: string | null; created_at: string; profiles: { full_name: string | null; avatar_url: string | null } }) => (
                    <div key={review.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={review.profiles?.avatar_url ?? ""} />
                        <AvatarFallback className="text-xs">
                          {review.profiles?.full_name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{review.profiles?.full_name}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < review.rating ? "fill-current text-yellow-500" : "text-muted-foreground"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — sticky CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-6 space-y-4">
                  {/* Thumbnail */}
                  {course.thumbnail_url && (
                    <div className="relative aspect-video rounded-md overflow-hidden bg-muted mb-4">
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="text-2xl font-bold">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </div>

                  {isEnrolled ? (
                    <Button className="w-full" asChild>
                      <Link href={firstLesson ? `/learn/${course.id}/${firstLesson.id}` : "#"}>
                        <Play className="mr-2 h-4 w-4" />
                        Continue learning
                      </Link>
                    </Button>
                  ) : (
                    <EnrollButton courseId={course.id} userId={user?.id ?? null} courseName={course.title} />
                  )}

                  <Separator />
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 shrink-0" />
                      {lessons.length} lessons
                    </li>
                    {totalMinutes > 0 && (
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        {Math.round(totalMinutes)} minutes of content
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" />
                      Lifetime access
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
