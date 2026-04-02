import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-14 border-b border-border" />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-44 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex gap-1 border-b border-border pb-px">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-20" />)}
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 flex gap-4 items-center">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 px-6 py-4 border-b border-border last:border-0">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
