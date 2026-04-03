"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, Award, Download, X } from "lucide-react";

export interface CourseProgress {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  thumbnailUrl: string | null;
  lessons: { id: string; position: number }[];
  completedCount: number;
  pct: number;
  nextLessonId: string | null;
  completedAt: string | null;
}

interface Props {
  studentName: string;
  courses: CourseProgress[];
}

function CertificateModal({
  course,
  studentName,
  onClose,
}: {
  course: CourseProgress;
  studentName: string;
  onClose: () => void;
}) {
  const certRef = useRef<HTMLDivElement>(null);

  const completedDate = course.completedAt
    ? new Date(course.completedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=960,height=720");
    if (!printWindow) return;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate – ${course.courseTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 24px;
    }
    .cert {
      width: 100%;
      max-width: 800px;
      border: 3px solid #0f0f0f;
      padding: 4px;
    }
    .cert-inner {
      border: 1px solid #d4a843;
      padding: 56px 64px;
      text-align: center;
      background: #fffef9;
    }
    .brand { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 32px; }
    .brand-icon {
      width: 40px; height: 40px; border-radius: 8px; background: #0f0f0f;
      display: flex; align-items: center; justify-content: center;
    }
    .brand-name { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }
    .divider { width: 80px; height: 2px; background: #d4a843; margin: 24px auto; }
    .cert-title { font-size: 34px; font-weight: 800; letter-spacing: -1px; color: #0f0f0f; margin-bottom: 8px; }
    .cert-sub { font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 32px; }
    .awarded-to { font-size: 13px; color: #666; margin-bottom: 8px; }
    .student-name { font-size: 40px; font-weight: 700; color: #0f0f0f; margin-bottom: 4px; }
    .name-rule { width: 320px; height: 1px; background: #d4a843; margin: 8px auto 24px; }
    .for-completing { font-size: 14px; color: #666; margin-bottom: 12px; }
    .course-name { font-size: 22px; font-weight: 700; color: #0f0f0f; margin-bottom: 36px; }
    .issued { font-size: 12px; color: #999; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="cert">
    <div class="cert-inner">
      <div class="brand">
        <div class="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <span class="brand-name">TechOps Academy</span>
      </div>
      <div class="cert-title">Certificate</div>
      <div class="cert-sub">of Completion</div>
      <div class="divider"></div>
      <div class="awarded-to">This is to certify that</div>
      <div class="student-name">${studentName}</div>
      <div class="name-rule"></div>
      <div class="for-completing">has successfully completed</div>
      <div class="course-name">${course.courseTitle}</div>
      <div class="issued">Issued on ${completedDate}</div>
    </div>
  </div>
</body>
</html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-base">Certificate of Completion</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Certificate */}
        <div className="p-6">
          <div ref={certRef} className="border-2 border-foreground/90 p-1 rounded-sm">
            <div className="border border-yellow-500/60 bg-card rounded-sm px-10 py-12 text-center">
              {/* Brand */}
              <div className="flex items-center justify-center gap-2.5 mb-8">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
                  <BookOpen className="h-4 w-4 text-background" />
                </div>
                <span className="font-bold text-lg tracking-tight">TechOps Academy</span>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-yellow-500/40" />
                <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div className="flex-1 h-px bg-yellow-500/40" />
              </div>

              <p className="text-3xl font-extrabold tracking-tight mb-1">Certificate</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">of Completion</p>

              <p className="text-sm text-muted-foreground mb-2">This is to certify that</p>
              <p className="text-4xl font-bold tracking-tight mb-1">{studentName}</p>
              <div className="w-64 h-px bg-yellow-500/50 mx-auto mb-6" />

              <p className="text-sm text-muted-foreground mb-3">has successfully completed</p>
              <p className="text-xl font-bold mb-8">{course.courseTitle}</p>

              <p className="text-xs text-muted-foreground">Issued on {completedDate}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 pb-5">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint} className="bg-brand text-brand-foreground hover:bg-brand/90 gap-2">
            <Download className="h-4 w-4" />
            Print / Download
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DashboardClient({ studentName, courses }: Props) {
  const [tab, setTab] = useState<"courses" | "certificates">("courses");
  const [openCert, setOpenCert] = useState<CourseProgress | null>(null);

  const completedCourses = courses.filter((c) => c.pct === 100);

  return (
    <>
      {openCert && (
        <CertificateModal
          course={openCert}
          studentName={studentName}
          onClose={() => setOpenCert(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {studentName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {courses.length} enrolled course{courses.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {(["courses", "certificates"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "certificates" && <Award className="h-3.5 w-3.5" />}
            {t === "certificates" ? `Certificates${completedCourses.length > 0 ? ` (${completedCourses.length})` : ""}` : "My Courses"}
          </button>
        ))}
      </div>

      {/* My Courses */}
      {tab === "courses" && (
        <>
          {courses.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => {
                const nextLesson = c.nextLessonId;
                return (
                  <Card key={c.enrollmentId} className="overflow-hidden flex flex-col">
                    <div className="relative aspect-video bg-muted">
                      {c.thumbnailUrl ? (
                        <Image src={c.thumbnailUrl} alt={c.courseTitle} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      {c.pct === 100 && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <Badge>Completed</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 flex flex-col gap-3 flex-1">
                      <h3 className="font-semibold leading-snug line-clamp-2">{c.courseTitle}</h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{c.completedCount}/{c.lessons.length} lessons</span>
                        <span>{c.pct}%</span>
                      </div>
                      <Progress value={c.pct} className="h-1.5" />
                      <Button size="sm" className="w-full mt-auto" asChild>
                        <Link href={nextLesson ? `/learn/${c.courseId}/${nextLesson}` : `/courses`}>
                          <Play className="mr-2 h-3.5 w-3.5" />
                          {c.pct === 0 ? "Start" : c.pct === 100 ? "Review" : "Resume"}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h2 className="text-lg font-semibold">No courses yet</h2>
              <p className="text-sm text-muted-foreground mt-1">Browse courses to get started</p>
              <Button className="mt-6" asChild>
                <Link href="/courses">Browse courses</Link>
              </Button>
            </div>
          )}
        </>
      )}

      {/* Certificates */}
      {tab === "certificates" && (
        <>
          {completedCourses.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {completedCourses.map((c) => (
                <Card key={c.enrollmentId} className="overflow-hidden flex flex-col">
                  <div className="relative aspect-video bg-muted">
                    {c.thumbnailUrl ? (
                      <Image src={c.thumbnailUrl} alt={c.courseTitle} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Award className="h-10 w-10 text-yellow-500/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Badge className="gap-1 bg-yellow-500 text-yellow-950 hover:bg-yellow-500">
                        <Award className="h-3 w-3" /> Completed
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 flex flex-col gap-3 flex-1">
                    <h3 className="font-semibold leading-snug line-clamp-2">{c.courseTitle}</h3>
                    <p className="text-xs text-muted-foreground">
                      Completed{" "}
                      {c.completedAt
                        ? new Date(c.completedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </p>
                    <Button
                      size="sm"
                      className="w-full mt-auto gap-2"
                      onClick={() => setOpenCert(c)}
                    >
                      <Award className="h-3.5 w-3.5" />
                      View Certificate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Award className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h2 className="text-lg font-semibold">No certificates yet</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Complete a course to earn your first certificate
              </p>
              <Button className="mt-6" variant="outline" onClick={() => setTab("courses")}>
                View my courses
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
