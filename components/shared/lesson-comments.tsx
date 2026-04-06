"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { initials } from "@/lib/utils";
import type { LessonComment } from "@/types";

interface LessonCommentsProps {
  lessonId: string;
  courseId: string;
  currentUserId: string;
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

function UserBadge({ name }: { name: string }) {
  const ini = initials(name);
  return (
    <div className="h-6 w-6 shrink-0 rounded bg-brand/10 border border-brand/20 flex items-center justify-center font-mono text-[8px] font-black text-brand">
      {ini}
    </div>
  );
}

function CommentInput({
  placeholder,
  value,
  onChange,
  onSubmit,
  onCancel,
  submitting,
  submitLabel = "post",
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitting: boolean;
  submitLabel?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      <div
        className={`relative rounded-lg border transition-colors duration-150 overflow-hidden ${
          focused ? "border-brand/30 bg-card" : "border-border/40 bg-muted/20"
        }`}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={3}
          spellCheck={false}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
          }}
          className="w-full resize-none bg-transparent px-3 py-2.5 font-mono text-[12px] leading-5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
          style={{ caretColor: "hsl(38,85%,50%)" }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-muted-foreground/30">⌘+enter to submit</span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="font-mono text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              cancel
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={submitting || !value.trim()}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest bg-brand/10 border border-brand/30 text-brand hover:bg-brand/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : null}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
  onReply,
}: {
  comment: LessonComment;
  currentUserId: string;
  onDelete: (id: string) => void;
  onReply: (parentId: string, body: string) => Promise<void>;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const name = (comment.profiles as { full_name: string | null } | null)?.full_name ?? "Student";

  const handleReply = async () => {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyBody.trim());
    setReplyBody("");
    setShowReply(false);
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <UserBadge name={name} />
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-bold text-foreground/80">{name}</span>
            <span className="font-mono text-[9px] text-muted-foreground/40 tabular-nums">
              {formatRelative(comment.created_at)} ago
            </span>
          </div>

          {/* Body */}
          <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
            {comment.body}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setShowReply((v) => !v)}
              className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-brand transition-colors"
            >
              ↳ reply
            </button>

            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="flex items-center gap-0.5 font-mono text-[9px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                {showReplies ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                <span className="tabular-nums">{comment.replies.length}</span>
              </button>
            )}

            {comment.student_id === currentUserId && (
              <button
                onClick={() => onDelete(comment.id)}
                className="ml-auto font-mono text-[9px] text-muted-foreground/25 hover:text-red-500/60 transition-colors"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReply && (
            <div className="mt-3">
              <CommentInput
                placeholder="// write a reply…"
                value={replyBody}
                onChange={setReplyBody}
                onSubmit={handleReply}
                onCancel={() => setShowReply(false)}
                submitting={submitting}
                submitLabel="reply"
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 space-y-3 border-l border-brand/15 pl-3">
          {comment.replies.map((reply) => {
            const replyName = (reply.profiles as { full_name: string | null } | null)?.full_name ?? "Student";
            return (
              <div key={reply.id} className="flex gap-2.5">
                <UserBadge name={replyName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] font-bold text-foreground/80">{replyName}</span>
                    <span className="font-mono text-[9px] text-muted-foreground/40 tabular-nums">
                      {formatRelative(reply.created_at)} ago
                    </span>
                  </div>
                  <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
                    {reply.body}
                  </p>
                  {reply.student_id === currentUserId && (
                    <button
                      onClick={() => onDelete(reply.id)}
                      className="mt-1.5 font-mono text-[9px] text-muted-foreground/25 hover:text-red-500/60 transition-colors"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LessonComments({ lessonId, courseId, currentUserId }: LessonCommentsProps) {
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/comments?lessonId=${lessonId}&courseId=${courseId}`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments ?? []);
    }
    setLoading(false);
  }, [lessonId, courseId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handlePost = async () => {
    if (!body.trim()) return;
    setPosting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, courseId, body: body.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setBody("");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Failed to post comment.");
    }
    setPosting(false);
  };

  const handleReply = async (parentId: string, replyBody: string) => {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, courseId, body: replyBody, parentId }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies ?? []), data.comment] }
            : c
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) =>
        prev
          .filter((c) => c.id !== id)
          .map((c) => ({
            ...c,
            replies: (c.replies ?? []).filter((r) => r.id !== id),
          }))
      );
    } else {
      toast.error("Failed to delete comment.");
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-border/40">

      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
          discussion
        </span>
        {comments.length > 0 && (
          <span className="font-mono text-[9px] tabular-nums text-muted-foreground/30">
            [{comments.length}]
          </span>
        )}
      </div>

      {/* Compose */}
      <div className="flex gap-2.5 mb-6">
        <div className="h-6 w-6 shrink-0 mt-0.5 rounded bg-brand/20 border border-brand/30 flex items-center justify-center font-mono text-[8px] font-black text-brand">
          me
        </div>
        <div className="flex-1">
          <CommentInput
            placeholder="// ask a question or share your thoughts…"
            value={body}
            onChange={setBody}
            onSubmit={handlePost}
            submitting={posting}
          />
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="flex items-center gap-2 py-4 font-mono text-[11px] text-muted-foreground/40">
          <Loader2 className="h-3 w-3 animate-spin" />
          loading…
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-mono text-[10px] text-muted-foreground/30">— no messages yet —</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
