"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md">
      {/* Image skeleton - matches aspect-[4/3] of attraction card */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      {/* Details section */}
      <div className="space-y-2.5 p-4">
        {/* Location line */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Rating line */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
          </div>
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-3 w-12" />
        </div>

        {/* Price line */}
        <Skeleton className="h-6 w-24" />

        {/* Open time line */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <Skeleton className="h-[400px] w-full rounded-2xl" />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-white p-6 shadow-sm"
        >
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm"
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}
