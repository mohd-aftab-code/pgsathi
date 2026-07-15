import React from "react";

export default function PGCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-neutral-200 shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-56 md:h-48 w-full bg-neutral-200 shrink-0"></div>
      
      {/* Content Skeleton */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-neutral-200 rounded-md w-3/4"></div>
          <div className="h-8 bg-neutral-200 rounded-md w-1/4"></div>
        </div>
        
        <div className="h-4 bg-neutral-200 rounded-md w-1/2"></div>
        
        <div className="flex gap-2">
          <div className="h-5 bg-neutral-200 rounded-md w-16"></div>
          <div className="h-5 bg-neutral-200 rounded-md w-16"></div>
          <div className="h-5 bg-neutral-200 rounded-md w-16"></div>
        </div>
        
        <div className="mt-auto pt-3 border-t border-neutral-100 flex justify-between">
          <div className="h-6 bg-neutral-200 rounded-md w-20"></div>
          <div className="h-6 bg-neutral-200 rounded-md w-16"></div>
        </div>
      </div>
    </div>
  );
}
