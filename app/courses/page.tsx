import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { CourseCard } from "@/components/shared/course-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Layers } from "lucide-react";
import { CATEGORIES } from "@/types";
import type { Course } from "@/types";
import Link from "next/link";

export const revalidate = 300;
export const metadata = { title: "Courses" };

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const supabase = createClient();
  const { category, q } = searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  let query = supabase
    .from("courses")
    .select(`*, profiles(*), lessons(count), enrollments(count), reviews(rating)`)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category) query = query.contains("categories", [category]);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: courses } = await query;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-brand/5 via-background to-muted/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--brand)/0.08),transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 border border-brand/20">
              <Layers className="h-5 w-5 text-brand" />
            </div>
            <span className="text-sm font-medium text-brand uppercase tracking-wider">Course Library</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            {category ? category : q ? `Results for "${q}"` : "All Courses"}
          </h1>
          <p className="mt-2 text-muted-foreground text-base">
            {courses?.length ?? 0} course{(courses?.length ?? 0) !== 1 ? "s" : ""} available
            {category ? ` in ${category}` : ""}
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <form className="flex gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search courses…"
                defaultValue={q}
                className="pl-9 h-9"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary" className="shrink-0">
              Search
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/courses"
              className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                !category
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground bg-transparent"
              }`}
            >
              All
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/courses?category=${encodeURIComponent(cat)}`}
                className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                  category === cat
                    ? "bg-brand text-brand-foreground border-brand"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground bg-transparent"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Grid */}
        {courses && courses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course: Course) => (
              <CourseCard key={course.id} course={course} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border mb-4">
              <Search className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-semibold">No courses found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or category</p>
            <Button variant="outline" size="sm" className="mt-6" asChild>
              <Link href="/courses">Clear filters</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
