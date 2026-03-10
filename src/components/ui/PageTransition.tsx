'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition — smooth fade transitions between pages
 */
export function PageTransition({ children }: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const pathname = usePathname();

  useEffect(() => {
    if (children !== displayChildren) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setIsTransitioning(false);
      }, 150); // Half of transition duration

      return () => clearTimeout(timer);
    }
  }, [children, displayChildren]);

  return (
    <div
      className={cn(
        "transition-opacity duration-300 ease-out",
        isTransitioning ? "opacity-0" : "opacity-100"
      )}
    >
      {displayChildren}
    </div>
  );
}

/**
 * Stagger animation container for lists
 */
interface StaggerContainerProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function StaggerContainer({ children, delay = 50, className }: StaggerContainerProps) {
  return (
    <div className={cn("animate-in fade-in duration-500", className)}>
      {children}
    </div>
  );
}

/**
 * Stagger item with incremental delay
 */
interface StaggerItemProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
  className?: string;
}

export function StaggerItem({ children, index, delay = 50, className }: StaggerItemProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-4 duration-500",
        className
      )}
      style={{
        animationDelay: `${index * delay}ms`,
        animationFillMode: 'backwards',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Slide in animation for content
 */
interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
}

export function SlideIn({
  children,
  direction = 'up',
  delay = 0,
  className
}: SlideInProps) {
  const getSlideClass = () => {
    switch (direction) {
      case 'left':
        return 'slide-in-from-left-6';
      case 'right':
        return 'slide-in-from-right-6';
      case 'up':
        return 'slide-in-from-bottom-6';
      case 'down':
        return 'slide-in-from-top-6';
      default:
        return 'slide-in-from-bottom-6';
    }
  };

  return (
    <div
      className={cn(
        "animate-in fade-in duration-600 ease-out",
        getSlideClass(),
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'backwards',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Scale in animation for buttons and interactive elements
 */
interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, className }: ScaleInProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in zoom-in-95 duration-400 ease-out",
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'backwards',
      }}
    >
      {children}
    </div>
  );
}