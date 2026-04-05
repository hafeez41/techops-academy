"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Award, Download, X, Play, ChevronRight } from "lucide-react";

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
    .cert { width: 100%; max-width: 800px; border: 3px solid #0f0f0f; padding: 4px; }
    .cert-inner { border: 1px solid #d4a843; padding: 56px 64px; text-align: center; background: #fffef9; }
    .brand { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 32px; }
    .brand-icon { width: 40px; height: 40px; border-radius: 8px; background: #0f0f0f; display: flex; align-items: center; justify-content: center; }
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
    setTimeout(() => { printWindow.print(); }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          boxShadow: "0 32px 96px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
              cert
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/25">/</span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
              completion
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Certificate preview */}
        <div className="p-6">
          <div ref={certRef} className="border-2 border-foreground/80 p-px">
            <div className="border border-yellow-500/40 bg-card px-10 py-12 text-center">
              <div className="flex items-center justify-center gap-2.5 mb-8">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
                  <BookOpen className="h-4 w-4 text-background" />
                </div>
                <span className="font-bold text-lg tracking-tight">TechOps Academy</span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-yellow-500/30" />
                <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div className="flex-1 h-px bg-yellow-500/30" />
              </div>
              <p className="text-3xl font-extrabold tracking-tight mb-1">Certificate</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
                of Completion
              </p>
              <p className="text-sm text-muted-foreground mb-2">This is to certify that</p>
              <p className="text-4xl font-bold tracking-tight mb-1">{studentName}</p>
              <div className="w-64 h-px bg-yellow-500/40 mx-auto mb-6" />
              <p className="text-sm text-muted-foreground mb-3">has successfully completed</p>
              <p className="text-xl font-bold mb-8">{course.courseTitle}</p>
              <p className="font-mono text-[10px] text-muted-foreground/60">Issued {completedDate}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/15 transition-colors"
          >
            <Download className="h-3 w-3" />
            print / download
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardClient({ studentName, courses }: Props) {
  const [tab, setTab] = useState<"courses" | "certificates">("courses");
  const [openCert, setOpenCert] = useState<CourseProgress | null>(null);

  const completedCourses = courses.filter((c) => c.pct === 100);
  const inProgressCourses = courses.filter((c) => c.pct > 0 && c.pct < 100);
  const firstName = studentName.split(" ")[0];

  return (
    <>
      {openCert && (
        <CertificateModal
          course={openCert}
          studentName={studentName}
          onClose={() => setOpenCert(null)}
        />
      )}

      {/* ── Header strip ── */}
      <div className="mb-10">
        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-brand mb-2">
          ~/dashboard
        </p>
        <h1 className="text-5xl font-black tracking-tighter leading-none mb-5">
          {firstName}.
        </h1>

        {/* Stats strip */}
        {courses.length > 0 && (
          <div className="inline-grid grid-flow-col auto-cols-fr divide-x divide-border/60 border border-border/50 rounded-lg overflow-hidden">
            {[
              { value: courses.length, label: "enrolled" },
              { value: inProgressCourses.length, label: "in progress" },
              { value: completedCourses.length, label: "completed" },
            ].map((s) => (
              <div key={s.label} className="px-5 py-3 text-center">
                <div className="font-mono text-2xl font-black tabular-nums leading-none mb-1">
                  {s.value}
                </div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-0 border-b border-border/40 mb-6">
        {(["courses", "certificates"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex items-center gap-1.5 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors ${
              tab === t ? "text-brand" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "certificates" && completedCourses.length > 0 && (
              <span className={`font-mono text-[9px] tabular-nums ${tab === t ? "text-brand/70" : "text-muted-foreground/40"}`}>
                {completedCourses.length}
              </span>
            )}
            {t === "courses" ? "my_courses" : "certificates"}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-brand" />
            )}
          </button>
        ))}
      </div>

      {/* ── My Courses ── */}
      {tab === "courses" && (
        <>
          {courses.length > 0 ? (
            <div className="flex flex-col">
              {courses.map((c, i) => {
                const isComplete = c.pct === 100;
                const isNew = c.pct === 0;
                const href = c.nextLessonId
                  ? `/learn/${c.courseId}/${c.nextLessonId}`
                  : `/courses`;

                return (
                  <div
                    key={c.enrollmentId}
                    className={`group flex items-center gap-4 py-3 transition-colors hover:bg-muted/30 ${
                      i !== 0 ? "border-t border-border/40" : ""
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-14 w-24 shrink-0 rounded overflow-hidden bg-muted">
                      {c.thumbnailUrl ? (
                        <Image
                          src={c.thumbnailUrl}
                          alt={c.courseTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="h-full w-full"
                          style={{
                            backgroundImage:
                              "linear-gradient(135deg, rgba(245,158,11,0.08) 25%, transparent 25%, transparent 50%, rgba(245,158,11,0.08) 50%, rgba(245,158,11,0.08) 75%, transparent 75%)",
                            backgroundSize: "8px 8px",
                          }}
                        />
                      )}
                      {/* Progress strip */}
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/40">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${c.pct}%`,
                            background: isComplete ? "#eab308" : "hsl(var(--brand))",
                          }}
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug line-clamp-1 group-hover:text-brand transition-colors">
                        {c.courseTitle}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-widest">
                          {isComplete ? (
                            <span className="text-yellow-500">✓ complete</span>
                          ) : isNew ? (
                            <span className="text-muted-foreground/40">○ not_started</span>
                          ) : (
                            <span className="text-brand">● in_progress</span>
                          )}
                        </span>
                        <span className="font-mono text-[9px] text-muted-foreground/40 tabular-nums">
                          {c.completedCount}/{c.lessons.length}
                        </span>
                        <span
                          className="font-mono text-[9px] font-black tabular-nums"
                          style={{ color: isComplete ? "#eab308" : "hsl(var(--brand))" }}
                        >
                          {c.pct}%
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <Link
                      href={href}
                      className="group/btn flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-brand transition-colors shrink-0"
                    >
                      <Play className="h-2.5 w-2.5" />
                      {isNew ? "start" : isComplete ? "review" : "resume"}
                      <ChevronRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="font-mono text-7xl font-black text-muted-foreground/[0.07] select-none mb-8">
                [ ]
              </p>
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">
                no courses yet
              </p>
              <p className="text-sm text-muted-foreground/50 mb-8">
                Browse the catalog and start your first course.
              </p>
              <Link
                href="/courses"
                className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-brand hover:text-brand/70 transition-colors"
              >
                browse_courses
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </>
      )}

      {/* ── Certificates ── */}
      {tab === "certificates" && (
        <>
          {completedCourses.length > 0 ? (
            <div className="flex flex-col">
              {completedCourses.map((c, i) => (
                <div
                  key={c.enrollmentId}
                  className={`group flex items-center gap-4 py-3 transition-colors hover:bg-muted/30 ${
                    i !== 0 ? "border-t border-border/40" : ""
                  }`}
                >
                  {/* Thumbnail / award badge */}
                  <div className="relative h-14 w-24 shrink-0 rounded overflow-hidden bg-muted">
                    {c.thumbnailUrl ? (
                      <Image
                        src={c.thumbnailUrl}
                        alt={c.courseTitle}
                        fill
                        className="object-cover opacity-40"
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/10">
                      <Award className="h-6 w-6 text-yellow-500/60" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug line-clamp-1">
                      {c.courseTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-yellow-500">
                        ✓ certified
                      </span>
                      {c.completedAt && (
                        <span className="font-mono text-[9px] text-muted-foreground/40 tabular-nums">
                          {new Date(c.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => setOpenCert(c)}
                    className="group/btn flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-yellow-500 transition-colors shrink-0"
                  >
                    <Award className="h-2.5 w-2.5" />
                    view
                    <ChevronRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="font-mono text-7xl font-black text-muted-foreground/[0.07] select-none mb-8">
                [ ]
              </p>
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">
                no certificates yet
              </p>
              <p className="text-sm text-muted-foreground/50 mb-8">
                Complete a course to earn your first certificate.
              </p>
              <button
                onClick={() => setTab("courses")}
                className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                view_my_courses
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
