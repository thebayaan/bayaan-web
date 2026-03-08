'use client';

import { useEffect } from 'react';
import type { Metadata } from "next";
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AdhkarSearch } from '@/components/adhkar/AdhkarSearch';
import { CategoryCard } from '@/components/adhkar/CategoryCard';
import { useAdhkarStore } from '@/stores/useAdhkarStore';

export default function AdhkarPage() {
  const {
    loadData,
    getFilteredCategories,
    loading,
    error,
  } = useAdhkarStore();

  const filteredCategories = getFilteredCategories();

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary">Loading adhkar...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text mb-2">
            Failed to load adhkar
          </h1>
          <p className="text-secondary text-center mb-4">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <SectionHeader>Adhkar</SectionHeader>
        <p className="text-[color:var(--color-secondary)] mt-2">
          Islamic remembrances and supplications for daily life
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-8">
        <AdhkarSearch />
      </div>

      {/* Categories grid */}
      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mb-4 rounded-full bg-[color:var(--color-card)] flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[color:var(--color-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[color:var(--color-label)] mb-2">
              No categories found
            </h3>
            <p className="text-[color:var(--color-secondary)]">
              Try adjusting your search or filters to find adhkar categories.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="mt-12 pt-8 border-t border-[color:var(--color-divider)]">
        <div className="flex flex-wrap gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-[color:var(--color-label)] mb-1">
              {filteredCategories.length}
            </div>
            <div className="text-sm text-[color:var(--color-hint)]">
              {filteredCategories.length === 1 ? 'Category' : 'Categories'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[color:var(--color-label)] mb-1">
              {filteredCategories.reduce((sum, cat) => sum + cat.dhikrCount, 0)}
            </div>
            <div className="text-sm text-[color:var(--color-hint)]">
              Total Adhkar
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
