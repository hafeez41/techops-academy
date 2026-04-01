import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Star, PlayCircle } from "lucide-react";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  isAdmin?: boolean;
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

  const avgRating =
    course.reviews && course.reviews.length > 0
      ? course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length
      : null;

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="group overflow-hidden h-full flex flex-col border-border/60 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <PlayCircle className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
          {course.price === 0 && (
            <Badge className="absolute top-2 left-2 bg-brand text-brand-foreground border-0 text-xs font-semibold">
              Free
            </Badge>
          )}
          {course.categories?.[0] && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 text-xs bg-background/80 backdrop-blur-sm"
            >
              {course.categories[0]}
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-col gap-2.5 p-4 flex-1">
          <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-brand transition-colors duration-200">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-1.5">
            <Avatar className="h-4 w-4">
              <AvatarImage src={course.profiles?.avatar_url ?? ""} />
              <AvatarFallback className="text-[8px] bg-brand text-brand-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{instructorName}</span>
          </div>

          {/* Rating */}
          {avgRating ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-yellow-500">{avgRating.toFixed(1)}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({course.reviews!.length})
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No ratings yet</div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3 mt-auto">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {lessonCount} lessons
            </div>
            {isAdmin && (
              <span className="text-muted-foreground">{studentCount.toLocaleString()} students</span>
            )}
            <span className="font-bold text-foreground text-sm">
              {course.price === 0 ? "Free" : `$${course.price.toLocaleString()}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
