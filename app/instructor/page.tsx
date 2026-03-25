import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Users, PlusCircle, Eye, EyeOff } from "lucide-react";
import type { Course } from "@/types";

export const metadata = { title: "Instructor Hub" };

export default async function InstructorPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "instructor") redirect("/dashboard");

  const { data: courses } = await supabase
    .from("courses")
    .select("*, lessons(count), enrollments(count)")
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false });

  const totalStudents = courses?.reduce(
    (acc: number, c: { enrollments: { count: number }[] }) =>
      acc + (c.enrollments?.[0]?.count ?? 0),
    0
  ) ?? 0;

  const totalCourses = courses?.length ?? 0;
  const publishedCourses = courses?.filter((c: { is_published: boolean }) => c.is_published).length ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Instructor Hub</h1>
            <p className="mt-1 text-muted-foreground">Manage your courses and students</p>
          </div>
          <Button asChild>
            <Link href="/instructor/courses/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New course
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Total courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalCourses}</p>
              <p className="text-xs text-muted-foreground mt-1">{publishedCourses} published</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Total students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-8" />

        {/* Courses list */}
        <h2 className="text-lg font-semibold mb-4">Your courses</h2>
        {courses && courses.length > 0 ? (
          <div className="space-y-3">
            {courses.map((course: Course & { enrollments: { count: number }[]; lessons: { count: number }[] }) => (
              <Link key={course.id} href={`/instructor/courses/${course.id}`}>
                <Card className="hover:border-foreground/20 transition-all cursor-pointer">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{course.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {course.lessons?.[0]?.count ?? 0} lessons ·{" "}
                        {course.enrollments?.[0]?.count ?? 0} students
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <Badge variant={course.is_published ? "default" : "secondary"}>
                        {course.is_published ? (
                          <><Eye className="mr-1 h-3 w-3" />Published</>
                        ) : (
                          <><EyeOff className="mr-1 h-3 w-3" />Draft</>
                        )}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="font-medium">No courses yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first course to get started</p>
            <Button className="mt-6" asChild>
              <Link href="/instructor/courses/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create course
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
