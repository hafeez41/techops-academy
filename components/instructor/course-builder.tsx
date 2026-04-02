"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { StudentsTab } from "@/components/instructor/students-tab";
import {
  GripVertical,
  PlusCircle,
  Trash2,
  Upload,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Video,
  FileText,
  Link2,
  LayoutTemplate,
  Users,
  BookOpen,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Plus,
  X,
} from "lucide-react";
import type { Course, Lesson, LessonType, ProgressionMode, CourseSection } from "@/types";
import { CATEGORIES as CAT_LIST } from "@/types";

interface CourseBuilderProps {
  course: Course | null;
  lessons: Lesson[];
  sections: CourseSection[];
  userId: string;
}

const LESSON_TYPES: { value: LessonType; label: string; icon: React.ReactNode }[] = [
  { value: "video",  label: "Video",   icon: <Video className="h-3.5 w-3.5" /> },
  { value: "text",   label: "Text",    icon: <FileText className="h-3.5 w-3.5" /> },
  { value: "link",   label: "Link",    icon: <Link2 className="h-3.5 w-3.5" /> },
  { value: "mixed",  label: "Mixed",   icon: <LayoutTemplate className="h-3.5 w-3.5" /> },
  { value: "quiz",   label: "Quiz",    icon: <HelpCircle className="h-3.5 w-3.5" /> },
];

// ── Inline quiz editor shown inside a quiz-type lesson card ───────────────────
interface QuizQ { id?: string; question: string; pass_threshold: number; options: { id?: string; text: string; is_correct: boolean }[] }

function QuizEditor({ lessonId, courseId }: { lessonId: string; courseId: string }) {
  const [questions, setQuestions] = useState<QuizQ[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/quiz?lessonId=${lessonId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.questions?.length) setQuestions(d.questions);
        else setQuestions([{ question: "", pass_threshold: 70, options: [{ text: "", is_correct: true }, { text: "", is_correct: false }] }]);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [lessonId]);

  const addQuestion = () =>
    setQuestions((p) => [...p, { question: "", pass_threshold: 70, options: [{ text: "", is_correct: true }, { text: "", is_correct: false }] }]);

  const removeQuestion = (qi: number) =>
    setQuestions((p) => p.filter((_, i) => i !== qi));

  const updateQuestion = (qi: number, field: keyof QuizQ, value: unknown) =>
    setQuestions((p) => p.map((q, i) => i === qi ? { ...q, [field]: value } : q));

  const addOption = (qi: number) =>
    setQuestions((p) => p.map((q, i) => i === qi ? { ...q, options: [...q.options, { text: "", is_correct: false }] } : q));

  const removeOption = (qi: number, oi: number) =>
    setQuestions((p) => p.map((q, i) => i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q));

  const updateOption = (qi: number, oi: number, field: "text" | "is_correct", value: string | boolean) =>
    setQuestions((p) => p.map((q, i) => {
      if (i !== qi) return q;
      const opts = q.options.map((o, j) => {
        if (field === "is_correct" && value === true) return { ...o, is_correct: j === oi };
        return j === oi ? { ...o, [field]: value } : o;
      });
      return { ...q, options: opts };
    }));

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/quiz", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, courseId, questions }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!loaded) return <div className="flex items-center gap-2 text-xs text-muted-foreground py-2"><Loader2 className="h-3 w-3 animate-spin" /> Loading questions…</div>;

  return (
    <div className="space-y-3 mt-1">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-md border border-border/60 bg-background p-3 space-y-2">
          <div className="flex items-start gap-2">
            <Input
              placeholder={`Question ${qi + 1}`}
              value={q.question}
              onChange={(e) => updateQuestion(qi, "question", e.target.value)}
              className="h-8 text-sm flex-1"
            />
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Pass %</span>
              <Input
                type="number"
                min={1}
                max={100}
                value={q.pass_threshold}
                onChange={(e) => updateQuestion(qi, "pass_threshold", Number(e.target.value))}
                className="h-8 w-14 text-xs"
              />
              <button onClick={() => removeQuestion(qi)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pl-2">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={opt.is_correct}
                  onChange={() => updateOption(qi, oi, "is_correct", true)}
                  className="accent-brand shrink-0"
                  title="Mark as correct answer"
                />
                <Input
                  placeholder={`Option ${oi + 1}`}
                  value={opt.text}
                  onChange={(e) => updateOption(qi, oi, "text", e.target.value)}
                  className="h-7 text-xs flex-1"
                />
                {q.options.length > 2 && (
                  <button onClick={() => removeOption(qi, oi)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addOption(qi)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              <Plus className="h-3 w-3" /> Add option
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2">
        <button
          onClick={addQuestion}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add question
        </button>
        <Button
          size="sm"
          variant="outline"
          className={`h-7 text-xs ml-auto ${saved ? "border-green-500 text-green-600" : ""}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
          {saved ? "Saved!" : "Save quiz"}
        </Button>
      </div>
    </div>
  );
}

function SortableLesson({
  lesson,
  sections,
  onUpdate,
  onDelete,
  onUpload,
}: {
  lesson: Lesson & { _uploading?: boolean; _uploadPct?: number };
  sections: CourseSection[];
  onUpdate: (id: string, fields: Partial<Lesson>) => void;
  onDelete: (id: string) => void;
  onUpload: (lessonId: string, file: File) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const type: LessonType = lesson.lesson_type ?? "video";
  const showVideo = type === "video" || type === "mixed";
  const showText  = type === "text"  || type === "mixed";
  const showLink  = type === "link";
  const showQuiz  = type === "quiz";

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 space-y-3">
          {/* Title + free-preview toggle */}
          <div className="flex items-center gap-3">
            <Input
              placeholder="Lesson title"
              value={lesson.title}
              onChange={(e) => onUpdate(lesson.id, { title: e.target.value })}
              className="h-8 text-sm"
            />
            <div className="flex items-center gap-2 shrink-0">
              <Label className="text-xs text-muted-foreground">Preview</Label>
              <Switch
                checked={lesson.is_free_preview}
                onCheckedChange={(v) => onUpdate(lesson.id, { is_free_preview: v })}
              />
            </div>
          </div>

          {/* Section assignment */}
          {sections.length > 0 && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground shrink-0">Section</Label>
              <select
                value={lesson.section_id ?? ""}
                onChange={(e) =>
                  onUpdate(lesson.id, { section_id: e.target.value || null })
                }
                className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">— General (no section) —</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lesson type selector */}
          <div className="flex items-center gap-1.5">
            {LESSON_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => onUpdate(lesson.id, { lesson_type: t.value })}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors border ${
                  type === t.value
                    ? "border-brand/60 bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Video upload (video + mixed) */}
          {showVideo && (
            <div className="space-y-1.5">
              {lesson.mux_playback_id ? (
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Video ready
                </div>
              ) : lesson._uploading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  {(lesson._uploadPct ?? 0) < 100
                    ? `Uploading… ${lesson._uploadPct ?? 0}%`
                    : "Processing…"}
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  Upload video
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUpload(lesson.id, file);
                    }}
                  />
                </label>
              )}
              {lesson._uploading && (lesson._uploadPct ?? 0) < 100 && (
                <div className="h-1.5 w-full max-w-xs rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-300"
                    style={{ width: `${lesson._uploadPct ?? 0}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Text content (text + mixed) */}
          {showText && (
            <Textarea
              placeholder="Write your lesson content in Markdown…&#10;&#10;## Heading&#10;**bold**, *italic*, `code`&#10;- bullet lists&#10;&#10;Supports full GFM."
              value={lesson.content ?? ""}
              onChange={(e) => onUpdate(lesson.id, { content: e.target.value })}
              rows={6}
              className="text-sm font-mono resize-y"
            />
          )}

          {/* Quiz editor */}
          {showQuiz && (
            lesson.id.startsWith("temp-") ? (
              <p className="text-xs text-muted-foreground">Save the course to enable quiz editing.</p>
            ) : (
              <QuizEditor lessonId={lesson.id} courseId={lesson.course_id} />
            )
          )}

          {/* External URL (link) */}
          {showLink && (
            <div className="space-y-1.5">
              <Input
                type="url"
                placeholder="https://example.com/resource"
                value={lesson.external_url ?? ""}
                onChange={(e) => onUpdate(lesson.id, { external_url: e.target.value })}
                className="h-8 text-sm"
              />
              <Textarea
                placeholder="Optional: describe what students will find at this link…"
                value={lesson.content ?? ""}
                onChange={(e) => onUpdate(lesson.id, { content: e.target.value })}
                rows={2}
                className="text-sm"
              />
            </div>
          )}
        </div>

        <button
          onClick={() => onDelete(lesson.id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Section group with collapsible lessons ──────────────────────────────────

function SectionGroup({
  sectionId,
  title,
  lessons,
  sections,
  allLessons,
  onUpdateLesson,
  onDeleteLesson,
  onUpload,
  onDeleteSection,
  onRenameSection,
}: {
  sectionId: string | null;
  title: string;
  lessons: (Lesson & { _uploading?: boolean; _uploadPct?: number })[];
  sections: CourseSection[];
  allLessons: (Lesson & { _uploading?: boolean; _uploadPct?: number })[];
  onUpdateLesson: (id: string, fields: Partial<Lesson>) => void;
  onDeleteLesson: (id: string) => void;
  onUpload: (lessonId: string, file: File) => void;
  onDeleteSection: ((id: string) => void) | null;
  onRenameSection: ((id: string, title: string) => void) | null;
}) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleRenameBlur = () => {
    setEditing(false);
    if (sectionId && onRenameSection && editTitle.trim() && editTitle !== title) {
      onRenameSection(sectionId, editTitle.trim());
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border border-border/60 bg-muted/20 overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/40">
          <CollapsibleTrigger
            render={
              <button className="text-muted-foreground hover:text-foreground transition-colors" />
            }
          >
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>

          {sectionId && editing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRenameBlur}
              onKeyDown={(e) => { if (e.key === "Enter") handleRenameBlur(); }}
              className="flex-1 rounded border border-input bg-background px-2 py-0.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          ) : (
            <button
              className="flex-1 text-left text-sm font-medium hover:text-foreground transition-colors"
              onClick={() => sectionId && setEditing(true)}
              title={sectionId ? "Click to rename" : undefined}
            >
              {title}
            </button>
          )}

          <Badge variant="outline" className="text-xs py-0 h-5">
            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
          </Badge>

          {sectionId && onDeleteSection && (
            <button
              onClick={() => onDeleteSection(sectionId)}
              className="text-muted-foreground hover:text-destructive transition-colors ml-1"
              title="Delete section (lessons will be unassigned)"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Lessons in section */}
        <CollapsibleContent>
          {lessons.length > 0 ? (
            <div className="p-2 space-y-2">
              <SortableContext
                items={lessons.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {lessons.map((lesson) => (
                  <SortableLesson
                    key={lesson.id}
                    lesson={lesson}
                    sections={sections}
                    onUpdate={onUpdateLesson}
                    onDelete={onDeleteLesson}
                    onUpload={onUpload}
                  />
                ))}
              </SortableContext>
            </div>
          ) : (
            <p className="px-4 py-3 text-xs text-muted-foreground italic">
              No lessons in this section yet.
            </p>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ── Main CourseBuilder ───────────────────────────────────────────────────────

export function CourseBuilder({
  course,
  lessons: initialLessons,
  sections: initialSections,
  userId,
}: CourseBuilderProps) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"curriculum" | "students">("curriculum");

  // Course fields
  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [price, setPrice] = useState(String(course?.price ?? "0"));
  const [categories, setCategories] = useState<string[]>(course?.categories ?? []);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const [isPublished, setIsPublished] = useState(course?.is_published ?? false);
  const [progressionMode, setProgressionMode] = useState<ProgressionMode>(
    course?.progression_mode ?? "self_paced"
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url ?? "");
  const [lessons, setLessons] = useState<(Lesson & { _uploading?: boolean; _uploadPct?: number })[]>(
    initialLessons
  );
  const [sections, setSections] = useState<CourseSection[]>(initialSections);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [courseId, setCourseId] = useState(course?.id ?? "");
  const [saveWarning, setSaveWarning] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  // Prerequisites
  const [prereqIds, setPrereqIds] = useState<string[]>([]);
  const [prereqCourses, setPrereqCourses] = useState<{ id: string; title: string }[]>([]);
  const [allCourses, setAllCourses] = useState<{ id: string; title: string }[]>([]);
  const [prereqLoaded, setPrereqLoaded] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    // Load existing prerequisites + all courses for dropdown
    Promise.all([
      supabase.from("course_prerequisites").select("prerequisite_id").eq("course_id", courseId),
      supabase.from("courses").select("id, title").eq("is_published", true).neq("id", courseId).order("title"),
    ]).then(([{ data: prereqs }, { data: courses }]) => {
      const ids = (prereqs ?? []).map((p) => p.prerequisite_id);
      setPrereqIds(ids);
      const all = courses ?? [];
      setAllCourses(all);
      setPrereqCourses(all.filter((c) => ids.includes(c.id)));
      setPrereqLoaded(true);
    });
  }, [courseId, supabase]);

  const handleAddPrereq = async (prereqId: string) => {
    if (prereqIds.includes(prereqId)) return;
    await supabase.from("course_prerequisites").upsert({ course_id: courseId, prerequisite_id: prereqId }, { onConflict: "course_id,prerequisite_id" });
    setPrereqIds((p) => [...p, prereqId]);
    setPrereqCourses((p) => [...p, allCourses.find((c) => c.id === prereqId)!].filter(Boolean));
  };

  const handleRemovePrereq = async (prereqId: string) => {
    await supabase.from("course_prerequisites").delete().eq("course_id", courseId).eq("prerequisite_id", prereqId);
    setPrereqIds((p) => p.filter((id) => id !== prereqId));
    setPrereqCourses((p) => p.filter((c) => c.id !== prereqId));
  };

  const toggleCategory = (cat: string) =>
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!catOpen) return;
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [catOpen]);

  const generateSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const generateUniqueSlug = async (base: string): Promise<string> => {
    let slug = base;
    let attempt = 1;
    while (true) {
      let q = supabase.from("courses").select("id").eq("slug", slug);
      if (courseId) q = q.neq("id", courseId);
      const { data } = await q.maybeSingle();
      if (!data) return slug;
      attempt++;
      slug = `${base}-${attempt}`;
    }
  };

  const handleSaveCourse = async () => {
    setSaving(true);
    const slug = await generateUniqueSlug(generateSlug(title));
    const coursePayload = {
      title,
      slug,
      description,
      price: parseFloat(price) || 0,
      categories,
      is_published: isPublished,
      thumbnail_url: thumbnailUrl || null,
      progression_mode: progressionMode,
    };

    if (!courseId) {
      const { data, error } = await supabase
        .from("courses")
        .insert({ instructor_id: userId, ...coursePayload })
        .select()
        .single();
      if (!error && data) {
        setCourseId(data.id);
        router.replace(`/instructor/courses/${data.id}`);
      }
    } else {
      await supabase.from("courses").update(coursePayload).eq("id", courseId);
    }

    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      if (l.id.startsWith("temp-")) continue;
      await supabase
        .from("lessons")
        .update({
          title: l.title,
          position: i,
          is_free_preview: l.is_free_preview,
          lesson_type: l.lesson_type ?? "video",
          content: l.content ?? null,
          external_url: l.external_url ?? null,
          section_id: l.section_id ?? null,
        })
        .eq("id", l.id);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
  };

  const handleThumbnailUpload = async (file: File) => {
    if (!courseId) { setSaveWarning("Save the course first before uploading a thumbnail."); return; }
    setSaveWarning("");
    setThumbnailUploading(true);
    const path = `${courseId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("thumbnails").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("thumbnails").getPublicUrl(path);
      setThumbnailUrl(publicUrl);
      await supabase.from("courses").update({ thumbnail_url: publicUrl }).eq("id", courseId);
    }
    setThumbnailUploading(false);
  };

  const handleAddLesson = async () => {
    if (!courseId) { setSaveWarning("Save the course first before adding lessons."); return; }
    setSaveWarning("");
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        title: "New lesson",
        position: lessons.length,
        lesson_type: "video",
        content: null,
        external_url: null,
        section_id: null,
      })
      .select()
      .single();
    if (!error && data) setLessons((prev) => [...prev, data]);
  };

  const handleAddSection = async () => {
    if (!courseId) { setSaveWarning("Save the course first before adding sections."); return; }
    setSaveWarning("");
    setAddingSection(true);
    const { data, error } = await supabase
      .from("course_sections")
      .insert({
        course_id: courseId,
        title: "New section",
        position: sections.length,
      })
      .select()
      .single();
    if (!error && data) setSections((prev) => [...prev, data as CourseSection]);
    setAddingSection(false);
  };

  const handleDeleteSection = async (sectionId: string) => {
    // Unlink lessons that belong to this section
    setLessons((prev) =>
      prev.map((l) => (l.section_id === sectionId ? { ...l, section_id: null } : l))
    );
    // Persist the unlink for already-saved lessons
    await supabase
      .from("lessons")
      .update({ section_id: null })
      .eq("section_id", sectionId);
    // Delete the section
    await supabase.from("course_sections").delete().eq("id", sectionId);
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const handleRenameSection = async (sectionId: string, newTitle: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title: newTitle } : s))
    );
    await supabase
      .from("course_sections")
      .update({ title: newTitle })
      .eq("id", sectionId);
  };

  const handleUpdateLesson = useCallback((id: string, fields: Partial<Lesson>) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...fields } : l)));
  }, []);

  const handleDeleteLesson = async (id: string) => {
    await supabase.from("lessons").delete().eq("id", id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const handleVideoUpload = async (lessonId: string, file: File) => {
    setLessons((prev) => prev.map((l) => l.id === lessonId ? { ...l, _uploading: true, _uploadPct: 0 } : l));
    const res = await fetch("/api/mux/upload-url", { method: "POST" });
    const { uploadId, url } = await res.json();
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setLessons((prev) => prev.map((l) => l.id === lessonId ? { ...l, _uploadPct: pct } : l));
        }
      });
      xhr.addEventListener("load", () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject()));
      xhr.addEventListener("error", reject);
      xhr.open("PUT", url);
      xhr.send(file);
    });
    let attempts = 0;
    const poll = async () => {
      attempts++;
      const statusRes = await fetch(`/api/mux/asset-status/${uploadId}`);
      const { status, assetId, playbackId } = await statusRes.json();
      if (status === "ready" && playbackId) {
        await supabase.from("lessons").update({ mux_asset_id: assetId, mux_playback_id: playbackId }).eq("id", lessonId);
        setLessons((prev) =>
          prev.map((l) =>
            l.id === lessonId
              ? { ...l, mux_asset_id: assetId, mux_playback_id: playbackId, _uploading: false, _uploadPct: undefined }
              : l
          )
        );
      } else if (attempts < 40) {
        setTimeout(poll, 3000);
      } else {
        setLessons((prev) => prev.map((l) => l.id === lessonId ? { ...l, _uploading: false, _uploadPct: undefined } : l));
      }
    };
    setTimeout(poll, 3000);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLessons((items) => {
        const oldIdx = items.findIndex((i) => i.id === active.id);
        const newIdx = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIdx, newIdx);
      });
    }
  };

  // ── Group lessons by section for display ──────────────────────────────────
  const unsectionedLessons = lessons.filter((l) => !l.section_id);
  const lessonsBySection = sections.map((s) => ({
    section: s,
    lessons: lessons.filter((l) => l.section_id === s.id),
  }));

  const hasSections = sections.length > 0;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {saveWarning && (
        <div className="mb-4 flex items-center justify-between rounded-md border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          <span>{saveWarning}</span>
          <button onClick={() => setSaveWarning("")} className="ml-4 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200">✕</button>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{courseId ? "Edit course" : "New course"}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id="publish" checked={isPublished} onCheckedChange={setIsPublished} />
            <Label htmlFor="publish" className="text-sm cursor-pointer flex items-center gap-1">
              {isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {isPublished ? "Published" : "Draft"}
            </Label>
          </div>
          <Button
            onClick={handleSaveCourse}
            disabled={saving || !title}
            className={saved ? "bg-green-600 hover:bg-green-600 text-white" : ""}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: course details + curriculum/students */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course details */}
          <Card className="overflow-visible">
            <CardHeader><CardTitle className="text-base">Course details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="e.g. Complete Kubernetes Bootcamp" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="What will students learn?" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="relative" ref={catRef}>
                    <button
                      type="button"
                      onClick={() => setCatOpen(!catOpen)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="truncate text-left">
                        {categories.length === 0 ? "Select categories" : categories.join(", ")}
                      </span>
                      <span className="ml-2 shrink-0 text-muted-foreground">▾</span>
                    </button>
                    {catOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
                        <div className="max-h-52 overflow-y-auto p-1">
                          {CAT_LIST.map((c) => (
                            <label key={c} className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted">
                              <input type="checkbox" checked={categories.includes(c)} onChange={() => toggleCategory(c)} className="accent-brand" />
                              {c}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Price (USD)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>

              {/* Progression mode */}
              <div className="space-y-2 pt-1">
                <Label>Student progression</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["self_paced", "instructor_gated"] as ProgressionMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setProgressionMode(mode)}
                      className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
                        progressionMode === mode
                          ? "border-brand/60 bg-brand/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {mode === "self_paced" ? "Self-paced" : "Instructor-gated"}
                      </span>
                      <span className="text-xs leading-snug">
                        {mode === "self_paced"
                          ? "Students unlock lessons by completing prior ones"
                          : "You manually unlock each lesson per student"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Curriculum / Students tabs */}
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 border-b border-border w-full pb-0">
                  <button
                    onClick={() => setActiveTab("curriculum")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      activeTab === "curriculum"
                        ? "border-brand text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Curriculum
                  </button>
                  {courseId && (
                    <button
                      onClick={() => setActiveTab("students")}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                        activeTab === "students"
                          ? "border-brand text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Students
                    </button>
                  )}
                  {activeTab === "curriculum" && (
                    <div className="flex-1 flex justify-end items-center gap-1.5 pr-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleAddSection}
                        disabled={addingSection}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {addingSection ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FolderPlus className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Add section
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleAddLesson} className="h-7 text-xs">
                        <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                        Add lesson
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {activeTab === "curriculum" ? (
                lessons.length === 0 && sections.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                    <p className="text-sm">No lessons yet. Add your first lesson to get started.</p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="space-y-3">
                      {/* Unsectioned lessons — always shown at top */}
                      {(!hasSections || unsectionedLessons.length > 0) && (
                        <SectionGroup
                          sectionId={null}
                          title={hasSections ? "General" : "Lessons"}
                          lessons={unsectionedLessons}
                          sections={sections}
                          allLessons={lessons}
                          onUpdateLesson={handleUpdateLesson}
                          onDeleteLesson={handleDeleteLesson}
                          onUpload={handleVideoUpload}
                          onDeleteSection={null}
                          onRenameSection={null}
                        />
                      )}

                      {/* Named sections */}
                      {lessonsBySection.map(({ section, lessons: sLessons }) => (
                        <SectionGroup
                          key={section.id}
                          sectionId={section.id}
                          title={section.title}
                          lessons={sLessons}
                          sections={sections}
                          allLessons={lessons}
                          onUpdateLesson={handleUpdateLesson}
                          onDeleteLesson={handleDeleteLesson}
                          onUpload={handleVideoUpload}
                          onDeleteSection={handleDeleteSection}
                          onRenameSection={handleRenameSection}
                        />
                      ))}
                    </div>
                  </DndContext>
                )
              ) : (
                <StudentsTab
                  courseId={courseId}
                  lessons={lessons}
                  progressionMode={progressionMode}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: thumbnail + lesson type legend */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Thumbnail</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {thumbnailUrl ? (
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video rounded-md bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  No thumbnail
                </div>
              )}
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors">
                {thumbnailUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {thumbnailUploading ? "Uploading…" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleThumbnailUpload(file);
                  }}
                />
              </label>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {courseId && (
            <Card>
              <CardHeader><CardTitle className="text-base">Prerequisites</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Students must complete these courses before enrolling.
                </p>

                {!prereqLoaded ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                  </div>
                ) : (
                  <>
                    {prereqCourses.length > 0 && (
                      <div className="space-y-1.5">
                        {prereqCourses.map((c) => (
                          <div key={c.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs">
                            <span className="truncate">{c.title}</span>
                            <button onClick={() => handleRemovePrereq(c.id)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {allCourses.filter((c) => !prereqIds.includes(c.id)).length > 0 && (
                      <select
                        className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onChange={(e) => { if (e.target.value) { handleAddPrereq(e.target.value); e.target.value = ""; } }}
                        defaultValue=""
                      >
                        <option value="" disabled>Add prerequisite…</option>
                        {allCourses
                          .filter((c) => !prereqIds.includes(c.id))
                          .map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                      </select>
                    )}

                    {prereqCourses.length === 0 && allCourses.filter((c) => !prereqIds.includes(c.id)).length === 0 && (
                      <p className="text-xs text-muted-foreground">No other published courses available.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lesson type legend */}
          <Card>
            <CardHeader><CardTitle className="text-base">Lesson types</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {LESSON_TYPES.map((t) => (
                <div key={t.value} className="flex items-start gap-2 text-xs">
                  <span className="text-muted-foreground mt-0.5">{t.icon}</span>
                  <div>
                    <span className="font-medium">{t.label}</span>
                    <span className="text-muted-foreground ml-1.5">
                      {t.value === "video"  && "— Mux-hosted video only"}
                      {t.value === "text"   && "— Markdown article"}
                      {t.value === "link"   && "— External URL + description"}
                      {t.value === "mixed"  && "— Video + written content"}
                      {t.value === "quiz"   && "— Multiple-choice assessment"}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
