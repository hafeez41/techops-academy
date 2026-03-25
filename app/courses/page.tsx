import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { CourseCard } from "@/components/shared/course-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/types";
import type { Course } from "@/types";

export const metadata = { title: "Courses" };

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const supabase = createClient();
  const { category, q } = searchParams;

  let query = supabase
    .from("courses")
    .select(`*, profiles(*), lessons(count), enrollments(count)`)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: courses } = await query;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">All Courses</h1>
          <p className="mt-2 text-muted-foreground">
            {courses?.length ?? 0} courses available
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <form className="flex-1 max-w-sm">
            <Input
              name="q"
              placeholder="Search courses…"
              defaultValue={q}
              className="h-9"
            />
          </form>
          <div className="flex flex-wrap gap-2">
            <a href="/courses">
              <Badge variant={!category ? "default" : "outline"} className="cursor-pointer">
                All
              </Badge>
            </a>
            {CATEGORIES.map((cat) => (
              <a key={cat} href={`/courses?category=${encodeURIComponent(cat)}`}>
                <Badge
                  variant={category === cat ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {cat}
                </Badge>
              </a>
            ))}
          </div>
        </div>

        {/* Grid */}
        {courses && courses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course: Course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <p className="text-lg font-medium">No courses found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </main>
    </div>
  );
}
