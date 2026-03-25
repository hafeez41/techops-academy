import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, PlayCircle } from "lucide-react";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const instructorName = course.profiles?.full_name ?? "Instructor";
  const initials = instructorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const lessonCount = course.lessons?.length ?? 0;
  const studentCount = course.enrollments?.[0]?.count ?? 0;

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
          {course.category && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 text-xs bg-background/80 backdrop-blur-sm"
            >
              {course.category}
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-col gap-3 p-4 flex-1">
          <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-brand transition-colors duration-200">
            {course.title}
          </h3>

          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-auto pt-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={course.profiles?.avatar_url ?? ""} />
              <AvatarFallback className="text-[10px] bg-brand text-brand-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{instructorName}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3 mt-1">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {lessonCount} lessons
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {studentCount.toLocaleString()} students
            </div>
            <span className="font-bold text-foreground text-sm">
              {course.price === 0 ? "Free" : `$${course.price.toLocaleString()}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
