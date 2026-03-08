'use client';

import { useEffect } from 'react';
import { initializeCollectionDB } from '@/lib/collectionService';

interface CollectionProviderProps {
  children: React.ReactNode;
}

export function CollectionProvider({ children }: CollectionProviderProps) {
  useEffect(() => {
    const init = async () => {
      try {
        await initializeCollectionDB();
      } catch (error) {
        console.error('Failed to initialize collection database:', error);
      }
    };

    init();
  }, []);

  return <>{children}</>;
}