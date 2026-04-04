import Link from "next/link";
import Image from "next/image";
import { Star, Clock, BookOpen, Users, ArrowRight } from "lucide-react";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  isAdmin?: boolean;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function CourseCard({ course, isAdmin = false }: CourseCardProps) {
  const instructorName = course.profiles?.full_name ?? "Instructor";
  const initials = instructorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const lessonCount = course.lessons?.length ?? 0;
  const studentCount = course.enrollments?.[0]?.count ?? 0;
  const totalSeconds = (course.lessons as Array<{ duration_seconds?: number | null }> | undefined)
    ?.reduce((acc, l) => acc + (l.duration_seconds ?? 0), 0) ?? 0;

  const avgRating =
    course.reviews && course.reviews.length > 0
      ? course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length
      : null;

  const isPaid = course.price > 0;

  return (
    <Link href={`/courses/${course.slug}`} className="group block h-full">
      <div className="relative flex flex-col h-full rounded-2xl bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/20 border border-border/50 hover:border-brand/50">

        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted shrink-0">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/20 via-muted to-card">
              <div className="flex flex-col items-center gap-2 opacity-60">
                <BookOpen className="h-10 w-10 text-brand" />
              </div>
            </div>
          )}

          {/* Gradient scrim — bleeds into card body so there's no hard edge */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />

          {/* Price pinned bottom-left over scrim */}
          <div className="absolute bottom-3 left-4">
            <span className={`text-xl font-black tracking-tight leading-none ${isPaid ? "text-foreground" : "text-brand"}`}>
              {isPaid ? `$${course.price}` : "Free"}
            </span>
          </div>

          {/* Category top-right */}
          {course.categories?.[0] && (
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-background/85 backdrop-blur-md text-foreground/70 px-2.5 py-1 rounded-lg border border-border/50">
                {course.categories[0]}
              </span>
            </div>
          )}

          {/* Free badge top-left */}
          {course.price === 0 && (
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-black uppercase tracking-widest bg-brand text-brand-foreground px-2.5 py-1 rounded-lg">
                Free
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 px-4 pt-1 pb-4 gap-3">

          {/* Title */}
          <h3 className="font-bold text-[15px] leading-snug line-clamp-2 text-foreground group-hover:text-brand transition-colors duration-200 pt-1">
            {course.title}
          </h3>

          {/* Instructor row */}
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand text-[9px] font-black ring-1 ring-brand/20">
              {initials}
            </div>
            <span className="text-xs text-muted-foreground truncate">{instructorName}</span>
          </div>

          {/* Rating */}
          {avgRating ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-yellow-500 tabular-nums">{avgRating.toFixed(1)}</span>
              <div className="flex gap-px">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground/60">({course.reviews!.length})</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/40 italic">No ratings yet</p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom meta row */}
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                {lessonCount}
              </span>
              {totalSeconds > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {formatDuration(totalSeconds)}
                </span>
              )}
              {isAdmin && studentCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  {studentCount.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground/50 group-hover:text-brand transition-colors duration-200 flex items-center gap-0.5 font-semibold">
              View <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
