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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";
import type { Course, Lesson } from "@/types";
import { CATEGORIES as CAT_LIST } from "@/types";

interface CourseBuilderProps {
  course: Course | null;
  lessons: Lesson[];
  userId: string;
}

function SortableLesson({
  lesson,
  onUpdate,
  onDelete,
  onUpload,
}: {
  lesson: Lesson & { _uploading?: boolean; _uploadPct?: number; };
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

          {/* Video upload */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
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
            </div>
            {lesson._uploading && (lesson._uploadPct ?? 0) < 100 && (
              <div className="h-1.5 w-full max-w-xs rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-300"
                  style={{ width: `${lesson._uploadPct ?? 0}%` }}
                />
              </div>
            )}
          </div>
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

export function CourseBuilder({ course, lessons: initialLessons, userId }: CourseBuilderProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [price, setPrice] = useState(String(course?.price ?? "0"));
  const [categories, setCategories] = useState<string[]>(course?.categories ?? []);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const toggleCategory = (cat: string) =>
    setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  const [isPublished, setIsPublished] = useState(course?.is_published ?? false);
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url ?? "");
  const [lessons, setLessons] = useState<(Lesson & { _uploading?: boolean; _uploadPct?: number })[]>(initialLessons);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [courseId, setCourseId] = useState(course?.id ?? "");
  const [saveWarning, setSaveWarning] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Close category dropdown on outside click
  useEffect(() => {
    if (!catOpen) return;
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [catOpen]);

  const generateSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSaveCourse = async () => {
    setSaving(true);
    const slug = generateSlug(title);

    if (!courseId) {
      // Create
      const { data, error } = await supabase
        .from("courses")
        .insert({
          instructor_id: userId,
          title,
          slug,
          description,
          price: parseFloat(price) || 0,
          categories,
          is_published: isPublished,
          thumbnail_url: thumbnailUrl || null,
        })
        .select()
        .single();
      if (!error && data) {
        setCourseId(data.id);
        router.replace(`/instructor/courses/${data.id}`);
      }
    } else {
      // Update
      await supabase
        .from("courses")
        .update({
          title,
          description,
          price: parseFloat(price) || 0,
          categories,
          is_published: isPublished,
          thumbnail_url: thumbnailUrl || null,
        })
        .eq("id", courseId);
    }

    // Save lesson order/titles
    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      if (l.id.startsWith("temp-")) continue;
      await supabase
        .from("lessons")
        .update({ title: l.title, position: i, is_free_preview: l.is_free_preview })
        .eq("id", l.id);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
  };

  const handleThumbnailUpload = async (file: File) => {
    if (!courseId) {
      setSaveWarning("Save the course first before uploading a thumbnail.");
      return;
    }
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
    if (!courseId) {
      setSaveWarning("Save the course first before adding lessons.");
      return;
    }
    setSaveWarning("");
    const position = lessons.length;
    const { data, error } = await supabase
      .from("lessons")
      .insert({ course_id: courseId, title: "New lesson", position })
      .select()
      .single();
    if (!error && data) {
      setLessons((prev) => [...prev, data]);
    }
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

    // 1. Get signed Mux upload URL
    const res = await fetch("/api/mux/upload-url", { method: "POST" });
    const { uploadId, url } = await res.json();

    // 2. XHR upload with progress — handles 500MB+ files reliably
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

    // 3. Poll until asset ready (max 40 attempts = ~2 min for large files)
    let attempts = 0;
    const poll = async () => {
      attempts++;
      const statusRes = await fetch(`/api/mux/asset-status/${uploadId}`);
      const { status, assetId, playbackId } = await statusRes.json();
      if (status === "ready" && playbackId) {
        await supabase
          .from("lessons")
          .update({ mux_asset_id: assetId, mux_playback_id: playbackId })
          .eq("id", lessonId);
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
        setLessons((prev) =>
          prev.map((l) => l.id === lessonId ? { ...l, _uploading: false, _uploadPct: undefined } : l)
        );
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
            <Switch
              id="publish"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="publish" className="text-sm cursor-pointer flex items-center gap-1">
              {isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {isPublished ? "Published" : "Draft"}
            </Label>
          </div>
          <Button onClick={handleSaveCourse} disabled={saving || !title} className={saved ? "bg-green-600 hover:bg-green-600 text-white" : ""}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course details */}
        <div className="lg:col-span-2 space-y-6">
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
                    <button type="button" onClick={() => setCatOpen(!catOpen)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
            </CardContent>
          </Card>

          {/* Curriculum */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Curriculum</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddLesson}>
                <PlusCircle className="mr-2 h-3.5 w-3.5" />
                Add lesson
              </Button>
            </CardHeader>
            <CardContent>
              {lessons.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {lessons.map((lesson) => (
                        <SortableLesson
                          key={lesson.id}
                          lesson={lesson}
                          onUpdate={handleUpdateLesson}
                          onDelete={handleDeleteLesson}
                          onUpload={handleVideoUpload}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                  <p className="text-sm">No lessons yet. Add your first lesson to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Thumbnail */}
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
                {thumbnailUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
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
        </div>
      </div>
    </main>
  );
}
