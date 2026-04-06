import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { CourseCard } from "@/components/shared/course-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "@/types";
import type { Course } from "@/types";
import Link from "next/link";

export const revalidate = 300;
export const metadata = { title: "Courses" };

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  let query = supabase
    .from("courses")
    .select(`*, profiles(*), lessons(id, duration_seconds), enrollments(count), reviews(rating)`)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category) query = query.contains("categories", [category]);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: courses } = await query;
  const count = courses?.length ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex flex-1">
        {/* ── Left sidebar ── */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-border/60 py-7 px-5">

          {/* Heading */}
          <div className="mb-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Library</p>
            <h1 className="text-xl font-black tracking-tight">Courses</h1>
            <p className="font-mono text-[11px] text-muted-foreground mt-0.5 tabular-nums">
              {count} available
            </p>
          </div>

          {/* Search */}
          <form className="mb-6" action="/courses" method="GET">
            {category && <input type="hidden" name="category" value={category} />}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                name="q"
                placeholder="search courses…"
                defaultValue={q}
                className="pl-8 h-8 text-xs rounded-lg font-mono border-border/60 bg-muted/30 focus-visible:bg-background"
              />
            </div>
          </form>

          {/* Category nav */}
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Category</p>
            <nav className="space-y-0.5">
              <Link
                href={q ? `/courses?q=${encodeURIComponent(q)}` : "/courses"}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                  !category
                    ? "bg-brand/10 text-brand font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span>All</span>
                {!category && <span className="font-mono text-[10px] tabular-nums">{count}</span>}
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/courses?category=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    category === cat
                      ? "bg-brand/10 text-brand font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span>{cat}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 xl:px-8 py-7">

          {/* Mobile header + search */}
          <div className="lg:hidden mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black tracking-tight">
                  {category ?? (q ? `"${q}"` : "All Courses")}
                </h1>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">{count} available</p>
              </div>
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>

            <form className="flex gap-2" action="/courses" method="GET">
              {category && <input type="hidden" name="category" value={category} />}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input name="q" placeholder="Search courses…" defaultValue={q}
                  className="pl-9 h-10 rounded-xl border-border/60 bg-muted/30" />
              </div>
              <Button type="submit" variant="secondary" className="h-10 rounded-xl px-4 shrink-0 text-sm">
                Search
              </Button>
            </form>

            {/* Mobile category chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Link href={q ? `/courses?q=${encodeURIComponent(q)}` : "/courses"}
                className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  !category ? "bg-brand text-brand-foreground" : "border border-border/60 text-muted-foreground hover:text-foreground"
                }`}>
                All
              </Link>
              {CATEGORIES.map((cat) => (
                <Link key={cat}
                  href={`/courses?category=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    category === cat ? "bg-brand text-brand-foreground" : "border border-border/60 text-muted-foreground hover:text-foreground"
                  }`}>
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop context bar */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {category ?? (q ? `Results for "${q}"` : "All Courses")}
              </h2>
              {(category || q) && (
                <Link href="/courses" className="font-mono text-[11px] text-brand hover:underline underline-offset-2 mt-0.5 inline-block">
                  ← clear filters
                </Link>
              )}
            </div>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">{count} course{count !== 1 ? "s" : ""}</span>
          </div>

          {/* Course grid */}
          {courses && courses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course: Course) => (
                <CourseCard key={course.id} course={course} isAdmin={isAdmin} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="font-mono text-6xl font-black text-muted-foreground/10 select-none leading-none mb-5">[ ]</div>
              <p className="text-base font-bold tracking-tight">No courses found</p>
              <p className="font-mono text-xs text-muted-foreground mt-1.5">
                {q ? `No results for "${q}"` : category ? `Nothing in ${category} yet` : "Check back soon"}
              </p>
              {(q || category) && (
                <Button variant="outline" size="sm" className="mt-5 rounded-lg h-8 text-xs font-mono" asChild>
                  <Link href="/courses">clear filters</Link>
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
