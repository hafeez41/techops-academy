"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, CheckCircle } from "lucide-react";

interface ReviewFormProps {
  courseId: string;
  existingReview: { rating: number; body: string | null } | null;
}

export function ReviewForm({ courseId, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, rating, body }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to submit review.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 py-2">
        <CheckCircle className="h-4 w-4 shrink-0" />
        {existingReview ? "Review updated." : "Review submitted. Thanks!"}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-medium">
        {existingReview ? "Update your review" : "Leave a review"}
      </p>

      {/* Star picker */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hover || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/40"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground self-center">
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
          </span>
        )}
      </div>

      <Textarea
        placeholder="Share what you thought about this course (optional)..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="resize-none text-sm"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button type="submit" size="sm" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
        {existingReview ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}
