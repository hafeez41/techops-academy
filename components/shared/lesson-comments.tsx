"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Trash2, CornerDownRight, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}


function CommentItem({
  comment,
  currentUserId,
  lessonId,
  courseId,
  onDelete,
  onReply,
}: {
  comment: LessonComment;
  currentUserId: string;
  lessonId: string;
  courseId: string;
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
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarFallback className="text-xs bg-muted">{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">{formatRelative(comment.created_at)}</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
            {comment.body}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setShowReply((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <CornerDownRight className="h-3 w-3" />
              Reply
            </button>
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
            {comment.student_id === currentUserId && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReply && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                className="text-sm resize-none flex-1"
              />
              <div className="flex flex-col gap-1.5">
                <Button size="sm" disabled={submitting || !replyBody.trim()} onClick={handleReply} className="h-8 text-xs">
                  {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Post"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReply(false)} className="h-8 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-border pl-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                <AvatarFallback className="text-xs bg-muted">
                  {initials((reply.profiles as { full_name: string | null } | null)?.full_name ?? null)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {(reply.profiles as { full_name: string | null } | null)?.full_name ?? "Student"}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatRelative(reply.created_at)}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                  {reply.body}
                </p>
                {reply.student_id === currentUserId && (
                  <button
                    onClick={() => onDelete(reply.id)}
                    className="mt-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
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
    <div className="mt-8 border-t border-border pt-8">
      <h3 className="font-semibold mb-5 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        Discussion
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">· {comments.length}</span>
        )}
      </h3>

      {/* Post a comment */}
      <div className="flex gap-3 mb-6">
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarFallback className="text-xs bg-muted">You</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ask a question or share your thoughts…"
            rows={3}
            className="text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">⌘+Enter to submit</span>
            <Button size="sm" disabled={posting || !body.trim()} onClick={handlePost} className="h-8 text-xs">
              {posting ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
              Post
            </Button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading discussion…
        </div>
      ) : comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to start the discussion!
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              lessonId={lessonId}
              courseId={courseId}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
