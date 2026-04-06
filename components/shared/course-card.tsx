import Link from "next/link";
import Image from "next/image";
import { Star, Clock, BookOpen, Users } from "lucide-react";
import type { Course } from "@/types";
import { initials, formatDuration } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  isAdmin?: boolean;
}

export function CourseCard({ course, isAdmin = false }: CourseCardProps) {
  const instructorName = course.profiles?.full_name ?? "Instructor";

  const lessonCount = course.lessons?.length ?? 0;
  const studentCount = course.enrollments?.[0]?.count ?? 0;
  const totalSeconds = (course.lessons as Array<{ duration_seconds?: number | null }> | undefined)
    ?.reduce((acc, l) => acc + (l.duration_seconds ?? 0), 0) ?? 0;

  const avgRating =
    course.reviews && course.reviews.length > 0
      ? course.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / course.reviews.length
      : null;

  return (
    <Link href={`/courses/${course.slug}`} className="group block h-full">
      <article className="relative flex flex-col h-full rounded-xl bg-card border border-border/50 overflow-hidden transition-all duration-200 hover:border-border hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5">

        {/* Thumbnail */}
        <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: "16/9" }}>
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            /* No-thumbnail: subtle pattern instead of empty box */
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: "hsl(224,20%,10%)",
                backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            >
              <BookOpen className="h-8 w-8 text-brand/30" />
            </div>
          )}

          {/* Bottom scrim */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card/95 to-transparent" />

          {/* Category — bottom left over scrim */}
          {course.categories?.[0] && (
            <div className="absolute bottom-3 left-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest bg-background/80 backdrop-blur-sm text-muted-foreground px-2 py-0.5 rounded border border-border/40">
                {course.categories[0]}
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-4 gap-2.5">

          {/* Title */}
          <h3 className="font-bold text-[14px] leading-snug line-clamp-2 text-foreground group-hover:text-brand transition-colors duration-150">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 shrink-0 rounded-full bg-brand/15 border border-brand/20 flex items-center justify-center font-mono text-[8px] font-black text-brand">
              {initials(instructorName)}
            </div>
            <span className="text-xs text-muted-foreground/70 truncate">{instructorName}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom row */}
          <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
            {/* Meta */}
            <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3 shrink-0" />
                {lessonCount}
              </span>
              {totalSeconds > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  {formatDuration(totalSeconds)}
                </span>
              )}
              {isAdmin && studentCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 shrink-0" />
                  {studentCount.toLocaleString()}
                </span>
              )}
            </div>

            {/* Rating */}
            {avgRating ? (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                <span className="font-mono text-[11px] font-bold text-yellow-500 tabular-nums">{avgRating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
