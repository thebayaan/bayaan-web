interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'shimmer' | 'pulse';
}

export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
  variant = 'shimmer',
}: SkeletonProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const variantClasses = {
    default: 'loading-skeleton',
    shimmer: 'loading-shimmer',
    pulse: 'animate-pulse-subtle bg-[color:var(--color-card)]',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${variantClasses[variant]} ${roundedClasses[rounded]} ${className}`}
      style={style}
    />
  );
}

// Preset skeleton components for common UI elements
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] rounded-xl p-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Skeleton width={48} height={48} rounded="lg" />
          <div className="flex-1 space-y-2">
            <Skeleton height={16} className="w-3/4" />
            <Skeleton height={12} className="w-1/2" />
          </div>
        </div>
        <Skeleton height={12} className="w-full" />
        <Skeleton height={12} className="w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  return (
    <Skeleton
      width={sizeMap[size]}
      height={sizeMap[size]}
      rounded="full"
      className={className}
    />
  );
}

export function SkeletonButton({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeMap = {
    sm: { width: 80, height: 28 },
    md: { width: 100, height: 36 },
    lg: { width: 120, height: 44 },
  };

  const { width, height } = sizeMap[size];

  return (
    <Skeleton
      width={width}
      height={height}
      rounded="lg"
      className={className}
    />
  );
}

export function SkeletonList({
  count = 3,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <Skeleton height={14} className="w-2/3" />
            <Skeleton height={12} className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({
  count = 6,
  columns = 3,
  className = '',
}: {
  count?: number;
  columns?: number;
  className?: string;
}) {
  const gridCols = `grid-cols-${columns}`;

  return (
    <div className={`grid ${gridCols} gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Specialized skeletons for Bayaan components
export function SkeletonSurahCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[color:var(--color-hover)] flex items-center justify-center">
            <Skeleton width={16} height={16} rounded="sm" />
          </div>
          <div className="space-y-2">
            <Skeleton height={16} width={120} />
            <Skeleton height={12} width={80} />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton height={12} width={60} />
          <Skeleton height={10} width={40} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonReciterCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] rounded-xl p-4 ${className}`}>
      <div className="text-center space-y-3">
        <SkeletonAvatar size="lg" className="mx-auto" />
        <div className="space-y-2">
          <Skeleton height={16} width={100} className="mx-auto" />
          <Skeleton height={12} width={80} className="mx-auto" />
        </div>
        <div className="flex justify-center space-x-2">
          <SkeletonButton size="sm" />
          <SkeletonButton size="sm" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPlayerBar({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[color:var(--color-card)] border-t border-[color:var(--color-card-border)] p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <SkeletonAvatar size="sm" />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} width={150} />
          <div className="flex items-center space-x-2">
            <Skeleton height={4} className="flex-1 rounded-full" />
            <Skeleton height={10} width={40} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <SkeletonButton size="sm" />
          <SkeletonButton size="sm" />
          <SkeletonButton size="sm" />
        </div>
      </div>
    </div>
  );
}