"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Lock,
  Unlock,
  UserPlus,
  Trash2,
  ChevronDown,
  Loader2,
  Users,
  CheckCircle,
} from "lucide-react";
import { initials } from "@/lib/utils";
import type { Lesson } from "@/types";

interface Student {
  id: string;
  full_name: string | null;
  email: string;
  enrolled_at: string;
  enrolled_by: string | null;
  completedCount: number;
}

interface StudentsTabProps {
  courseId: string;
  lessons: Lesson[];
  progressionMode: "self_paced" | "instructor_gated";
}

export function StudentsTab({ courseId, lessons, progressionMode }: StudentsTabProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [openStudentId, setOpenStudentId] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null); // "studentId-lessonId"

  const fetchStudents = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams({ courseId, progressionMode });
    const res = await fetch(`/api/instructor/enroll?${params}`);
    if (!res.ok) { setLoading(false); return; }

    const { enrollments, progress, unlocks } = await res.json() as {
      enrollments: Array<{
        student_id: string;
        enrolled_at: string;
        enrolled_by: string | null;
        profiles: { full_name: string | null; email: string | null } | null;
      }>;
      progress: Array<{ student_id: string; lesson_id: string }>;
      unlocks: Array<{ student_id: string; lesson_id: string }>;
    };

    if (!enrollments?.length) {
      setStudents([]);
      setLoading(false);
      return;
    }

    // Build progress count per student
    const progressCount: Record<string, number> = {};
    for (const p of progress ?? []) {
      progressCount[p.student_id] = (progressCount[p.student_id] ?? 0) + 1;
    }

    // Build unlock sets per student
    const unlockSets: Record<string, Set<string>> = {};
    for (const u of unlocks ?? []) {
      if (!unlockSets[u.student_id]) unlockSets[u.student_id] = new Set();
      unlockSets[u.student_id].add(u.lesson_id);
    }
    setUnlockedMap(unlockSets);

    const mapped: Student[] = enrollments.map((e) => ({
      id: e.student_id,
      full_name: e.profiles?.full_name ?? null,
      email: e.profiles?.email ?? e.student_id,
      enrolled_at: e.enrolled_at,
      enrolled_by: e.enrolled_by,
      completedCount: progressCount[e.student_id] ?? 0,
    }));

    setStudents(mapped);
    setLoading(false);
  }, [courseId, progressionMode]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    const res = await fetch("/api/instructor/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, email: addEmail.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAddError(data.error ?? "Enrollment failed.");
    } else {
      setAddEmail("");
      fetchStudents();
    }
    setAdding(false);
  };

  const handleRemove = async (studentId: string) => {
    await fetch("/api/instructor/enroll", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, studentId }),
    });
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setUnlockedMap((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  const handleToggleUnlock = async (studentId: string, lessonId: string) => {
    const key = `${studentId}-${lessonId}`;
    setTogglingKey(key);

    const isUnlocked = unlockedMap[studentId]?.has(lessonId) ?? false;

    await fetch("/api/instructor/unlock", {
      method: isUnlocked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, studentId, lessonId }),
    });

    setUnlockedMap((prev) => {
      const set = new Set(prev[studentId] ?? []);
      if (isUnlocked) set.delete(lessonId);
      else set.add(lessonId);
      return { ...prev, [studentId]: set };
    });

    setTogglingKey(null);
  };

  const handleUnlockAll = async (studentId: string) => {
    for (const lesson of lessons) {
      if (!(unlockedMap[studentId]?.has(lesson.id))) {
        await fetch("/api/instructor/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, studentId, lessonId: lesson.id }),
        });
      }
    }
    setUnlockedMap((prev) => ({
      ...prev,
      [studentId]: new Set(lessons.map((l) => l.id)),
    }));
  };

  const handleUnlockAllStudents = async () => {
    for (const student of students) {
      await handleUnlockAll(student.id);
    }
  };


  const totalLessons = lessons.length;

  return (
    <div className="space-y-4">
      {/* Add student */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          type="email"
          placeholder="student@email.com"
          value={addEmail}
          onChange={(e) => setAddEmail(e.target.value)}
          required
          className="flex-1 h-9 text-sm"
        />
        <Button type="submit" size="sm" disabled={adding || !addEmail.trim()}>
          {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
          <span className="ml-1.5">Add</span>
        </Button>
      </form>
      {addError && (
        <p className="text-xs text-destructive">{addError}</p>
      )}

      {/* Bulk actions */}
      {progressionMode === "instructor_gated" && students.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">
            {students.length} {students.length === 1 ? "student" : "students"} enrolled
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={handleUnlockAllStudents}
          >
            <Unlock className="h-3 w-3" />
            Unlock all lessons for all students
          </Button>
        </div>
      )}

      {/* Student list */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading students…
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
          <Users className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No students enrolled yet.</p>
          <p className="text-xs mt-1">Add a student above by their account email.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((student) => {
            const unlockedCount = unlockedMap[student.id]?.size ?? 0;
            const isOpen = openStudentId === student.id;
            const completionPct =
              totalLessons > 0
                ? Math.round((student.completedCount / totalLessons) * 100)
                : 0;

            return (
              <Collapsible
                key={student.id}
                open={isOpen}
                onOpenChange={(open) => setOpenStudentId(open ? student.id : null)}
              >
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-muted">
                        {initials(student.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {student.full_name ?? "Unnamed student"}
                      </p>
                      {student.email && !student.email.includes("-") && (
                        <p className="font-mono text-[10px] text-muted-foreground/60 truncate">{student.email}</p>
                      )}
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {student.completedCount}/{totalLessons} completed
                        </span>
                        {progressionMode === "instructor_gated" && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Unlock className="h-3 w-3" />
                            {unlockedCount}/{totalLessons} unlocked
                          </span>
                        )}
                        {student.enrolled_by && (
                          <Badge variant="outline" className="text-xs py-0 h-4">
                            Assigned
                          </Badge>
                        )}
                      </div>
                      {/* Completion progress bar */}
                      {totalLessons > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <Progress value={completionPct} className="h-1.5 flex-1" />
                          <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
                            {completionPct}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {progressionMode === "instructor_gated" && (
                        <CollapsibleTrigger
                          render={
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" />
                          }
                        >
                          Lessons
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </CollapsibleTrigger>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(student.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Lesson unlock panel */}
                  {progressionMode === "instructor_gated" && (
                    <CollapsibleContent>
                      <div className="border-t border-border px-4 pb-3 pt-2 space-y-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            Lesson access
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => handleUnlockAll(student.id)}
                          >
                            Unlock all
                          </Button>
                        </div>
                        {lessons.map((lesson, idx) => {
                          const unlocked = unlockedMap[student.id]?.has(lesson.id) ?? false;
                          const key = `${student.id}-${lesson.id}`;
                          const toggling = togglingKey === key;

                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs text-muted-foreground w-4 shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-xs truncate">{lesson.title}</span>
                              </div>
                              <button
                                onClick={() => handleToggleUnlock(student.id, lesson.id)}
                                disabled={toggling}
                                className={`shrink-0 ml-2 flex items-center gap-1 text-xs rounded px-2 py-0.5 transition-colors ${
                                  unlocked
                                    ? "text-green-600 dark:text-green-400 bg-green-500/10 hover:bg-green-500/20"
                                    : "text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                {toggling ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : unlocked ? (
                                  <Unlock className="h-3 w-3" />
                                ) : (
                                  <Lock className="h-3 w-3" />
                                )}
                                {unlocked ? "Unlocked" : "Locked"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  )}
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}
