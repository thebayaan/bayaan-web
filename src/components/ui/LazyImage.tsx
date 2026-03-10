'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  priority?: boolean;
}

/**
 * LazyImage - Progressive image loading with intersection observer
 * Provides smooth loading states and optimal performance
 */
export function LazyImage({
  src,
  alt,
  className,
  fallback,
  placeholder,
  onLoad,
  onError,
  sizes,
  priority = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0,
      }
    );

    const currentImg = imgRef.current;
    if (currentImg) {
      observer.observe(currentImg);
    }

    observerRef.current = observer;

    return () => {
      if (currentImg && observer) {
        observer.unobserve(currentImg);
      }
      observer.disconnect();
    };
  }, [priority, shouldLoad]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Default placeholder component
  const defaultPlaceholder = (
    <div
      className={cn(
        'flex items-center justify-center',
        'bg-gradient-to-br from-gray-100 to-gray-200',
        'dark:from-gray-800 dark:to-gray-700',
        className
      )}
      style={{ backgroundColor: 'var(--color-card)' }}
    >
      <svg
        className="w-8 h-8 opacity-40"
        fill="currentColor"
        style={{ color: 'var(--color-icon)' }}
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  // Error state
  if (isError && fallback) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={imgRef}
        src={fallback}
        alt={alt}
        className={cn(className, 'transition-opacity duration-300')}
        onLoad={handleLoad}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
      />
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder/Loading state */}
      {!isLoaded && (placeholder || defaultPlaceholder)}

      {/* Actual image */}
      {shouldLoad && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            'transition-opacity duration-500 ease-out',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          sizes={sizes}
        />
      )}

      {/* Loading shimmer effect */}
      {shouldLoad && !isLoaded && !isError && (
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ animationDelay: '0.5s' }}
        />
      )}

      {/* Global shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook for preloading images
 */
export function useImagePreloader() {
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  const preloadImages = async (srcs: string[]): Promise<void> => {
    try {
      await Promise.all(srcs.map(preloadImage));
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  };

  return { preloadImage, preloadImages };
}