import { renderHook, act } from '@testing-library/react';
import { useTranslationStore } from '@/stores/useTranslationStore';

describe('useTranslationStore', () => {
  beforeEach(() => {
    useTranslationStore.setState({
      selectedTranslation: null,
      showTranslations: false,
      translationPosition: 'below',
      fontSize: 'medium',
    });
  });

  test('should toggle translations on and off', () => {
    const { result } = renderHook(() => useTranslationStore());

    expect(result.current.showTranslations).toBe(false);

    act(() => {
      result.current.toggleTranslations();
    });

    expect(result.current.showTranslations).toBe(true);
  });

  test('should set selected translation', () => {
    const { result } = renderHook(() => useTranslationStore());

    act(() => {
      result.current.setSelectedTranslation('saheeh');
    });

    expect(result.current.selectedTranslation).toBe('saheeh');
  });
});