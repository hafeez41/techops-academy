import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Star, Clock, Users } from "lucide-react";
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
      <div className="relative flex flex-col h-full rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:border-brand/50 hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-0.5">

        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted shrink-0">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/20 via-muted to-muted/60">
              <div className="rounded-full bg-background/60 p-4 backdrop-blur-sm">
                <BookOpen className="h-8 w-8 text-brand/70" />
              </div>
            </div>
          )}

          {/* Overlay gradient at bottom of image */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {course.price === 0 && (
              <Badge className="bg-brand text-brand-foreground border-0 text-xs font-semibold shadow-sm">
                Free
              </Badge>
            )}
          </div>
          {course.categories?.[0] && (
            <Badge
              variant="secondary"
              className="absolute top-2.5 right-2.5 text-xs bg-background/80 backdrop-blur-sm border-0"
            >
              {course.categories[0]}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          {/* Title */}
          <h3 className="font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-brand transition-colors duration-200">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarImage src={course.profiles?.avatar_url ?? ""} />
              <AvatarFallback className="text-[8px] bg-brand/15 text-brand font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{instructorName}</span>
          </div>

          {/* Rating */}
          {avgRating ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-yellow-500">{avgRating.toFixed(1)}</span>
              <div className="flex gap-px">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({course.reviews!.length})</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">No ratings yet</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
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

          {/* Price footer */}
          <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
            <span className={`font-bold text-base ${isPaid ? "text-foreground" : "text-brand"}`}>
              {isPaid ? `$${course.price.toLocaleString()}` : "Free"}
            </span>
            <span className="text-xs text-muted-foreground group-hover:text-brand transition-colors font-medium">
              View course →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
