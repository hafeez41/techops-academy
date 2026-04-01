"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  userId: string | null;
  price?: number;
  firstLessonId?: string | null;
}

export function EnrollButton({ courseId, userId, price = 0, firstLessonId }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const router = useRouter();

  const isPaid = price > 0;

  const handleEnroll = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError(null);
    setPaymentRequired(false);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        if (firstLessonId) {
          router.push(`/learn/${courseId}/${firstLessonId}`);
        } else {
          router.refresh();
        }
      } else if (res.status === 402) {
        setPaymentRequired(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Enrollment failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentRequired) {
    return (
      <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-center">
        <CreditCard className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="font-medium">Online enrollment coming soon</p>
        <p className="text-xs text-muted-foreground">
          To enroll in this course, please{" "}
          <a href="/#contact" className="underline underline-offset-2 hover:text-foreground">
            contact us
          </a>{" "}
          and we'll get you set up.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button className="w-full h-11 text-base" onClick={handleEnroll} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!userId
          ? "Sign in to enroll"
          : isPaid
          ? `Enroll — $${price}`
          : "Enroll for free"}
      </Button>
      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
