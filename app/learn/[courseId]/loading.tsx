import { Skeleton } from "@/components/ui/skeleton";

export default function LearnLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Navbar */}
      <div className="h-14 border-b border-border shrink-0" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton */}
        <aside className="hidden w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 lg:flex flex-col">
          <div className="p-4 border-b border-zinc-800 space-y-3">
            <Skeleton className="h-3 w-20 bg-zinc-800" />
            <Skeleton className="h-5 w-4/5 bg-zinc-800" />
            <div className="space-y-1 mt-2">
              <Skeleton className="h-1.5 w-full bg-zinc-800 rounded-full" />
            </div>
          </div>
          <div className="flex-1 py-2 space-y-px">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-4 w-4 rounded-full bg-zinc-800 shrink-0" />
                <Skeleton className="h-4 flex-1 bg-zinc-800" />
              </div>
            ))}
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 overflow-y-auto bg-background">
          {/* Video skeleton */}
          <div className="bg-black">
            <div className="max-w-5xl mx-auto">
              <Skeleton className="w-full aspect-video rounded-none bg-zinc-900" />
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-3/5" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
