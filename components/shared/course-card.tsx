import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users } from "lucide-react";
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
      <Card className="group overflow-hidden transition-all hover:border-foreground/20 hover:shadow-md h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
          {course.price === 0 && (
            <Badge className="absolute top-2 left-2" variant="secondary">
              Free
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-col gap-3 p-4 flex-1">
          {course.category && (
            <Badge variant="outline" className="w-fit text-xs">
              {course.category}
            </Badge>
          )}
          <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-foreground/80 transition-colors">
            {course.title}
          </h3>

          <div className="flex items-center gap-2 mt-auto">
            <Avatar className="h-6 w-6">
              <AvatarImage src={course.profiles?.avatar_url ?? ""} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{instructorName}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {lessonCount} lessons
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {studentCount.toLocaleString()} students
            </div>
            <span className="font-semibold text-foreground">
              {course.price === 0 ? "Free" : `$${course.price}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
