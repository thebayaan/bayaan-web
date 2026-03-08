'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Metadata } from "next";
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DhikrList } from '@/components/adhkar/DhikrList';
import { useAdhkarStore } from '@/stores/useAdhkarStore';
import { AdhkarCategory, Dhikr } from '@/types/adhkar';
import { adhkarService } from '@/lib/adhkarService';

interface AdhkarCategoryPageProps {
  params: Promise<{ superId: string }>;
}

export default function AdhkarCategoryPage({
  params,
}: AdhkarCategoryPageProps) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<string>('');
  const [category, setCategory] = useState<AdhkarCategory | null>(null);
  const [adhkar, setAdhkar] = useState<Dhikr[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { loadData } = useAdhkarStore();

  useEffect(() => {
    const initPage = async () => {
      try {
        const resolvedParams = await params;
        setCategoryId(resolvedParams.superId);

        // Load adhkar data
        await loadData();

        // Get category and its adhkar
        const categoryData = adhkarService.getCategoryById(resolvedParams.superId);
        if (!categoryData) {
          setError('Category not found');
          return;
        }

        const categoryAdhkar = adhkarService.getAdhkarByCategory(resolvedParams.superId);

        setCategory(categoryData);
        setAdhkar(categoryAdhkar);
      } catch (err) {
        console.error('Failed to load category:', err);
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [params, loadData]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary">Loading category...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !category) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text mb-2">
            {error || 'Category not found'}
          </h1>
          <p className="text-secondary text-center mb-4">
            The adhkar category you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Button onClick={() => router.push('/adhkar')}>
            Back to Adhkar
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/adhkar')}
          className="mt-1"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>

        <div className="flex-1">
          <SectionHeader>{category.title}</SectionHeader>

          <div className="flex items-center gap-4 mt-3">
            <p className="text-[color:var(--color-secondary)]">
              {adhkar.length} {adhkar.length === 1 ? 'dhikr' : 'adhkar'}
            </p>

            {/* Category tags */}
            <div className="flex gap-2">
              {category.broadTags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-md bg-[color:var(--color-card)] text-[color:var(--color-hint)] capitalize border border-[color:var(--color-card-border)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dhikr list */}
      <DhikrList
        adhkar={adhkar}
        categoryName={category.title}
        showCompact={true}
      />
    </main>
  );
}
