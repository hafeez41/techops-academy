"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  userId: string | null;
  courseName: string;
}

export function EnrollButton({ courseId, userId, courseName }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Button className="w-full" onClick={handleEnroll} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {userId ? "Enroll now" : "Sign in to enroll"}
    </Button>
  );
}
