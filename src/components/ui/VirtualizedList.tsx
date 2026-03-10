'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/lib/cn';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * VirtualizedList - Efficiently renders large lists by only rendering visible items
 * Provides smooth scrolling performance for lists with hundreds or thousands of items
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  getItemKey = (_, index) => index,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    const visible = [];

    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i] !== undefined) {
        visible.push({
          item: items[i],
          index: i,
          key: getItemKey(items[i], i),
          top: i * itemHeight,
        });
      }
    }

    return visible;
  }, [items, visibleRange, itemHeight, getItemKey]);

  // Handle scroll events
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll]
  );

  // Total height of all items
  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{ height: totalHeight, position: 'relative' }}
        role="list"
        aria-label={`List with ${items.length} items`}
      >
        {visibleItems.map(({ item, index, key, top }) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              top,
              height: itemHeight,
              width: '100%',
            }}
            role="listitem"
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook for managing virtualized list state
 */
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<number | undefined>(undefined);

  const handleScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeout.current) {
      window.clearTimeout(scrollTimeout.current);
    }

    // Set new timeout to detect when scrolling stops
    scrollTimeout.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const top = index * itemHeight;
      const scrollElement = document.querySelector('[data-virtualized-list]');
      if (scrollElement) {
        scrollElement.scrollTo({ top, behavior });
      }
    },
    [itemHeight]
  );

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

    return {
      start: Math.max(0, startIndex),
      end: Math.min(items.length - 1, endIndex),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return {
    scrollTop,
    isScrolling,
    visibleRange,
    handleScroll,
    scrollToIndex,
  };
}

/**
 * Performance optimized grid component for large datasets
 */
interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  gap?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  className,
  gap = 0,
  getItemKey = (_, index) => index,
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate grid dimensions
  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowCount = Math.ceil(items.length / columnsPerRow);
  const rowHeight = itemHeight + gap;

  // Calculate visible rows
  const visibleRowStart = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
  const visibleRowEnd = Math.min(
    rowCount - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + 1
  );

  // Get visible items
  const visibleItems = useMemo(() => {
    const visible = [];

    for (let row = visibleRowStart; row <= visibleRowEnd; row++) {
      for (let col = 0; col < columnsPerRow; col++) {
        const index = row * columnsPerRow + col;
        if (index < items.length) {
          const item = items[index];
          visible.push({
            item,
            index,
            key: getItemKey(item, index),
            left: col * (itemWidth + gap),
            top: row * rowHeight,
          });
        }
      }
    }

    return visible;
  }, [
    items,
    visibleRowStart,
    visibleRowEnd,
    columnsPerRow,
    itemWidth,
    gap,
    rowHeight,
    getItemKey,
  ]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = rowCount * rowHeight;

  return (
    <div
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight, width: containerWidth }}
      onScroll={handleScroll}
    >
      <div
        style={{ height: totalHeight, position: 'relative' }}
        role="grid"
        aria-label={`Grid with ${items.length} items`}
      >
        {visibleItems.map(({ item, index, key, left, top }) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              left,
              top,
              width: itemWidth,
              height: itemHeight,
            }}
            role="gridcell"
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}