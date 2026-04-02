"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileSidebarProps {
  courseTitle: string;
  sidebarHeader: React.ReactNode;
  lessonList: React.ReactNode;
}

export function MobileSidebar({ sidebarHeader, lessonList }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Open course contents"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-zinc-950 border-zinc-800 flex flex-col">
        {sidebarHeader}
        <div className="flex-1 overflow-y-auto">
          {lessonList}
        </div>
      </SheetContent>
    </Sheet>
  );
}
