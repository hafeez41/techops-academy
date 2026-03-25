"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GripVertical, PlusCircle, Trash2, Upload, Loader2,
  Eye, EyeOff, CheckCircle, Clock, Paperclip, X, ArrowLeft,
} from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CATEGORIES as CAT_LIST } from "@/types";

interface LessonFile { id: string; name: string; url: string; size?: number | null }
interface Lesson {
  id: string; course_id: string; title: string; description: string | null;
  mux_asset_id: string | null; mux_playback_id: string | null;
  duration_seconds: number | null; position: number; is_free_preview: boolean;
  created_at: string;
  _uploading?: boolean; _uploadPct?: number; _files?: LessonFile[];
}
interface Course {
  id: string; title: string; slug: string; description: string | null;
  thumbnail_url: string | null; price: number; category: string | null;
  is_published: boolean; instructor_id: string; created_at: string;
}

function SortableLesson({
  lesson, onUpdate, onDelete, onVideoUpload, onFileUpload, onFileDelete,
}: {
  lesson: Lesson;
  onUpdate: (id: string, f: Partial<Lesson>) => void;
  onDelete: (id: string) => void;
  onVideoUpload: (id: string, file: File) => void;
  onFileUpload: (id: string, file: File) => void;
  onFileDelete: (lessonId: string, fileId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const [expanded, setExpanded] = useState(false);

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-border bg-card">
      {/* Header row */}
      <div className="flex items-center gap-3 p-3">
        <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground shrink-0">
          <GripVertical className="h-4 w-4" />
        </button>
        <Input
          placeholder="Lesson title"
          value={lesson.title}
          onChange={(e) => onUpdate(lesson.id, { title: e.target.value })}
          className="h-8 text-sm flex-1"
        />
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
          <Switch
            checked={lesson.is_free_preview}
            onCheckedChange={(v) => onUpdate(lesson.id, { is_free_preview: v })}
            className="scale-75"
          />
          Preview
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-muted-foreground hover:text-foreground px-2">
          {expanded ? "▲" : "▼"}
        </button>
        <button onClick={() => onDelete(lesson.id)} className="text-muted-foreground hover:text-destructive shrink-0">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border p-3 space-y-3">
          {/* Description */}
          <Textarea
            placeholder="Lesson description (optional)"
            value={lesson.description ?? ""}
            onChange={(e) => onUpdate(lesson.id, { description: e.target.value })}
            rows={2}
            className="text-sm"
          />

          {/* Video */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">Video</span>
              {lesson.mux_playback_id ? (
                <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3.5 w-3.5" /> Ready
                </span>
              ) : lesson._uploading ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  {(lesson._uploadPct ?? 0) < 100
                    ? `Uploading… ${lesson._uploadPct ?? 0}%`
                    : "Processing…"}
                </span>
              ) : (
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Upload className="h-3.5 w-3.5" /> Upload video
                  <input type="file" accept="video/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onVideoUpload(lesson.id, f); }} />
                </label>
              )}
            </div>
            {lesson._uploading && (lesson._uploadPct ?? 0) < 100 && (
              <div className="ml-[4.5rem] h-1.5 w-full max-w-xs rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-300"
                  style={{ width: `${lesson._uploadPct ?? 0}%` }}
                />
              </div>
            )}
          </div>

          {/* Files */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Attachments</span>
              <label className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Paperclip className="h-3 w-3" /> Add file
                <input type="file" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileUpload(lesson.id, f); }} />
              </label>
            </div>
            {(lesson._files ?? []).map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5 text-xs">
                <a href={f.url} target="_blank" rel="noopener noreferrer"
                  className="hover:underline text-foreground truncate max-w-xs">{f.name}</a>
                <button onClick={() => onFileDelete(lesson.id, f.id)}
                  className="ml-2 text-muted-foreground hover:text-destructive shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminCourseBuilder({
  course: initialCourse,
  adminId,
  onBack,
}: {
  course: Course | null;
  adminId: string;
  onBack: () => void;
}) {
  const supabase = createClient();

  const [title, setTitle] = useState(initialCourse?.title ?? "");
  const [description, setDescription] = useState(initialCourse?.description ?? "");
  const [price, setPrice] = useState(String(initialCourse?.price ?? "0"));
  const [categories, setCategories] = useState<string[]>((initialCourse as any)?.categories ?? []);
  const [catOpen, setCatOpen] = useState(false);

  const toggleCategory = (cat: string) =>
    setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  const [isPublished, setIsPublished] = useState(initialCourse?.is_published ?? false);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialCourse?.thumbnail_url ?? "");
  const [courseId, setCourseId] = useState(initialCourse?.id ?? "");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [saving, setSaving] = useState(false);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [warning, setWarning] = useState("");
  const [loaded, setLoaded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load lessons + files once we have a courseId
  const loadLessons = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("lessons")
      .select("*, lesson_files(*)")
      .eq("course_id", id)
      .order("position");
    if (data) {
      setLessons(data.map((l: any) => ({ ...l, _files: l.lesson_files ?? [] })));
    }
    setLoaded(true);
  }, [supabase]);

  // Load on mount if editing existing course
  useState(() => {
    if (initialCourse?.id) loadLessons(initialCourse.id);
    else setLoaded(true);
  });

  const generateSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    setSaving(true);
    const slug = generateSlug(title);
    if (!courseId) {
      const { data, error } = await supabase
        .from("courses")
        .insert({ instructor_id: adminId, title, slug, description, price: parseFloat(price) || 0, categories, is_published: isPublished, thumbnail_url: thumbnailUrl || null })
        .select().single();
      if (!error && data) {
        setCourseId(data.id);
        await loadLessons(data.id);
      }
    } else {
      await supabase.from("courses").update({ title, description, price: parseFloat(price) || 0, categories, is_published: isPublished, thumbnail_url: thumbnailUrl || null }).eq("id", courseId);
      for (let i = 0; i < lessons.length; i++) {
        const l = lessons[i];
        if (l.id.startsWith("temp-")) continue;
        await supabase.from("lessons").update({ title: l.title, description: l.description, position: i, is_free_preview: l.is_free_preview }).eq("id", l.id);
      }
    }
    setSaving(false);
  };

  const handleThumbnail = async (file: File) => {
    if (!courseId) { setWarning("Save the course first before uploading a thumbnail."); return; }
    setThumbUploading(true);
    const path = `${courseId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("thumbnails").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("thumbnails").getPublicUrl(path);
      setThumbnailUrl(publicUrl);
      await supabase.from("courses").update({ thumbnail_url: publicUrl }).eq("id", courseId);
    }
    setThumbUploading(false);
  };

  const handleAddLesson = async () => {
    if (!courseId) { setWarning("Save the course first before adding lessons."); return; }
    setWarning("");
    const position = lessons.length;
    const { data, error } = await supabase
      .from("lessons")
      .insert({ course_id: courseId, title: "New lesson", position })
      .select().single();
    if (!error && data) setLessons((p) => [...p, { ...data, _files: [] }]);
  };

  const handleUpdateLesson = useCallback((id: string, fields: Partial<Lesson>) => {
    setLessons((p) => p.map((l) => l.id === id ? { ...l, ...fields } : l));
  }, []);

  const handleDeleteLesson = async (id: string) => {
    await supabase.from("lessons").delete().eq("id", id);
    setLessons((p) => p.filter((l) => l.id !== id));
  };

  const handleVideoUpload = async (lessonId: string, file: File) => {
    setLessons((p) => p.map((l) => l.id === lessonId ? { ...l, _uploading: true, _uploadPct: 0 } : l));

    // Get signed Mux upload URL
    const res = await fetch("/api/mux/upload-url", { method: "POST" });
    const { uploadId, url } = await res.json();

    // XHR upload with progress tracking — handles 500MB+ files
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setLessons((p) => p.map((l) => l.id === lessonId ? { ...l, _uploadPct: pct } : l));
        }
      });
      xhr.addEventListener("load", () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject()));
      xhr.addEventListener("error", reject);
      xhr.open("PUT", url);
      xhr.send(file);
    });

    // Poll Mux until asset is ready (max 40 attempts = ~2 min for large files)
    let attempts = 0;
    const poll = async () => {
      attempts++;
      const statusRes = await fetch(`/api/mux/asset-status/${uploadId}`);
      const { status, assetId, playbackId } = await statusRes.json();
      if (status === "ready" && playbackId) {
        await supabase.from("lessons").update({ mux_asset_id: assetId, mux_playback_id: playbackId }).eq("id", lessonId);
        setLessons((p) => p.map((l) => l.id === lessonId ? { ...l, mux_asset_id: assetId, mux_playback_id: playbackId, _uploading: false, _uploadPct: undefined } : l));
      } else if (attempts < 40) {
        setTimeout(poll, 3000);
      } else {
        setLessons((p) => p.map((l) => l.id === lessonId ? { ...l, _uploading: false, _uploadPct: undefined } : l));
      }
    };
    setTimeout(poll, 3000);
  };

  const handleFileUpload = async (lessonId: string, file: File) => {
    const path = `${lessonId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("lesson-files").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("lesson-files").getPublicUrl(path);
      const { data } = await supabase.from("lesson_files").insert({ lesson_id: lessonId, name: file.name, url: publicUrl, size: file.size }).select().single();
      if (data) {
        setLessons((p) => p.map((l) => l.id === lessonId ? { ...l, _files: [...(l._files ?? []), data] } : l));
      }
    }
  };

  const handleFileDelete = async (lessonId: string, fileId: string) => {
    await supabase.from("lesson_files").delete().eq("id", fileId);
    setLessons((p) => p.map((l) => l.id === lessonId ? { ...l, _files: (l._files ?? []).filter((f) => f.id !== fileId) } : l));
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

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> All Courses
        </Button>
        <span className="text-muted-foreground">/</span>
        <h2 className="font-semibold">{courseId ? title || "Edit Course" : "New Course"}</h2>
      </div>

      {warning && (
        <div className="flex items-center justify-between rounded-md border border-yellow-500/40 bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-700 dark:text-yellow-400">
          <span>{warning}</span>
          <button onClick={() => setWarning("")} className="ml-4 hover:opacity-70">✕</button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: course details */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Course details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input placeholder="e.g. DevOps Bundle" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea placeholder="What will students learn?" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Categories</Label>
                  <div className="relative">
                    <button type="button" onClick={() => setCatOpen(!catOpen)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <span className="truncate text-left">
                        {categories.length === 0 ? "Select categories" : categories.join(", ")}
                      </span>
                      <span className="ml-2 shrink-0 text-muted-foreground">▾</span>
                    </button>
                    {catOpen && (
                      <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
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
                <div className="space-y-1.5">
                  <Label>Price (USD)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Curriculum */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Lessons</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddLesson} className="gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" /> Add lesson
              </Button>
            </CardHeader>
            <CardContent>
              {!loaded ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : lessons.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {lessons.map((lesson) => (
                        <SortableLesson
                          key={lesson.id}
                          lesson={lesson}
                          onUpdate={handleUpdateLesson}
                          onDelete={handleDeleteLesson}
                          onVideoUpload={handleVideoUpload}
                          onFileUpload={handleFileUpload}
                          onFileDelete={handleFileDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {courseId ? "No lessons yet — add your first lesson above." : "Save the course first to start adding lessons."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Publish */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-xs text-muted-foreground">{isPublished ? "Visible to students" : "Draft — not visible"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isPublished ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving || !title} className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {saving ? "Saving…" : courseId ? "Save changes" : "Create course"}
              </Button>
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Thumbnail</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt="thumbnail" className="w-full aspect-video object-cover rounded-md" />
              )}
              <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-brand/50 hover:text-foreground transition-colors ${!courseId ? "opacity-50 pointer-events-none" : ""}`}>
                {thumbUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {thumbUploading ? "Uploading…" : "Upload image"}
                <input type="file" accept="image/*" className="hidden" disabled={!courseId}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThumbnail(f); }} />
              </label>
              {!courseId && <p className="text-xs text-muted-foreground">Save the course first</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
