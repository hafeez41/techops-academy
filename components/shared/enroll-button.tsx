"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EnrollButtonProps {
  courseId: string;
  userId: string | null;
  firstLessonId?: string | null;
}

export function EnrollButton({ courseId, userId, firstLessonId }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEnroll = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        toast.success("Enrolled successfully!");
        if (firstLessonId) {
          router.push(`/learn/${courseId}/${firstLessonId}`);
        } else {
          router.refresh();
        }
      } else if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error ?? "You must complete prerequisites first.";
        setError(msg);
        toast.error("Prerequisites required", { description: msg });
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data.error ?? "Enrollment failed. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button className="w-full h-11 text-base" onClick={handleEnroll} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!userId ? "Sign in to enrol" : "Start Learning"}
      </Button>
      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
