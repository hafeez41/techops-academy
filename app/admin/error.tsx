"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
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
      <h2 className="text-xl font-semibold">Admin panel error</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        Something went wrong in the admin panel. Please try again.
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Retry
      </Button>
    </div>
  );
}
