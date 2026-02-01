import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string;
  height?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  className,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-bg-tertiary',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

// Skeleton compositions for common patterns
export function CardSkeleton() {
  return (
    <div className="p-5 bg-bg-secondary rounded-2xl border border-border-default space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="rounded" height="20px" width="60%" />
          <Skeleton variant="rounded" height="16px" width="40%" />
        </div>
      </div>
      <Skeleton variant="rounded" height="80px" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" height="36px" className="flex-1" />
        <Skeleton variant="rounded" height="36px" className="flex-1" />
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 bg-bg-secondary rounded-xl">
      <Skeleton variant="circular" width="40px" height="40px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="rounded" height="16px" width="70%" />
        <Skeleton variant="rounded" height="14px" width="40%" />
      </div>
      <Skeleton variant="circular" width="24px" height="24px" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton variant="rounded" height="32px" width="60%" />
        <Skeleton variant="rounded" height="20px" width="40%" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 bg-bg-secondary rounded-2xl border border-border-default space-y-3">
            <Skeleton variant="rounded" height="16px" width="50%" />
            <Skeleton variant="rounded" height="36px" width="70%" />
          </div>
        ))}
      </div>

      {/* Cards Skeleton */}
      {[...Array(2)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
