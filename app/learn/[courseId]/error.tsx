"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function LearnError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold">Failed to load lesson</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        There was a problem loading this lesson. Please try again or go back to your courses.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline" size="sm">
          Retry
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
