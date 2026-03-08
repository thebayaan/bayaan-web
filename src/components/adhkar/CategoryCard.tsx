'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { AdhkarCategory } from '@/types/adhkar';
import { cn } from '@/lib/cn';

interface CategoryCardProps {
  category: AdhkarCategory;
  className?: string;
}

// Map broad tags to colors and icons
const tagStyles: Record<string, { color: string; icon: string }> = {
  daily: { color: 'bg-blue-500', icon: '🌅' },
  prayer: { color: 'bg-green-500', icon: '🕌' },
  protection: { color: 'bg-purple-500', icon: '🛡️' },
  health: { color: 'bg-red-500', icon: '❤️' },
  travel: { color: 'bg-orange-500', icon: '✈️' },
  food: { color: 'bg-yellow-500', icon: '🍽️' },
  social: { color: 'bg-pink-500', icon: '👥' },
  nature: { color: 'bg-teal-500', icon: '🌿' },
  spiritual: { color: 'bg-indigo-500', icon: '✨' },
  home: { color: 'bg-amber-500', icon: '🏠' },
  clothing: { color: 'bg-cyan-500', icon: '👕' },
  general: { color: 'bg-gray-500', icon: '📝' },
};

export function CategoryCard({ category, className }: CategoryCardProps) {
  // Get the primary tag style
  const primaryTag = category.broadTags[0] || 'general';
  const tagStyle = tagStyles[primaryTag];

  return (
    <Link href={`/adhkar/${category.id}`}>
      <Card className={cn(
        'group p-6 cursor-pointer hover:bg-[color:var(--color-hover)] transition-all duration-200 hover:scale-[1.02]',
        className
      )}>
        <div className="flex items-start gap-4">
          {/* Icon/Indicator */}
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0',
            tagStyle.color
          )}>
            {tagStyle.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[color:var(--color-label)] group-hover:text-[color:var(--color-text)] transition-colors mb-1 line-clamp-2">
              {category.title}
            </h3>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-[color:var(--color-secondary)]">
                {category.dhikrCount} {category.dhikrCount === 1 ? 'dhikr' : 'adhkar'}
              </span>

              {/* Tags */}
              <div className="flex gap-1">
                {category.broadTags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-md bg-[color:var(--color-card)] text-[color:var(--color-hint)] capitalize"
                  >
                    {tag}
                  </span>
                ))}
                {category.broadTags.length > 2 && (
                  <span className="px-2 py-1 text-xs rounded-md bg-[color:var(--color-card)] text-[color:var(--color-hint)]">
                    +{category.broadTags.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="flex items-center text-[color:var(--color-icon)] group-hover:text-[color:var(--color-secondary)] transition-colors">
              <span className="text-sm">View adhkar</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}