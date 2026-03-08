import { renderHook, act } from '@testing-library/react';
import { useTranslationStore } from '@/stores/useTranslationStore';

describe('useTranslationStore', () => {
  beforeEach(() => {
    // Reset store to match default state
    useTranslationStore.setState({
      selectedTranslation: 'saheeh', // Match store default
      showTranslations: false,
      translationPosition: 'below',
      fontSize: 'medium',
    });
  });

  test('should have correct initial state', () => {
    const { result } = renderHook(() => useTranslationStore());

    expect(result.current.selectedTranslation).toBe('saheeh');
    expect(result.current.showTranslations).toBe(false);
    expect(result.current.translationPosition).toBe('below');
    expect(result.current.fontSize).toBe('medium');
  });

  test('should toggle translations on and off', () => {
    const { result } = renderHook(() => useTranslationStore());

    expect(result.current.showTranslations).toBe(false);

    act(() => {
      result.current.toggleTranslations();
    });

    expect(result.current.showTranslations).toBe(true);

    act(() => {
      result.current.toggleTranslations();
    });

    expect(result.current.showTranslations).toBe(false);
  });

  test('should set selected translation', () => {
    const { result } = renderHook(() => useTranslationStore());

    act(() => {
      result.current.setSelectedTranslation('pickthall');
    });

    expect(result.current.selectedTranslation).toBe('pickthall');

    act(() => {
      result.current.setSelectedTranslation('yusufali');
    });

    expect(result.current.selectedTranslation).toBe('yusufali');
  });

  test('should set translation position', () => {
    const { result } = renderHook(() => useTranslationStore());

    expect(result.current.translationPosition).toBe('below');

    act(() => {
      result.current.setTranslationPosition('side');
    });

    expect(result.current.translationPosition).toBe('side');

    act(() => {
      result.current.setTranslationPosition('below');
    });

    expect(result.current.translationPosition).toBe('below');
  });

  test('should set font size', () => {
    const { result } = renderHook(() => useTranslationStore());

    expect(result.current.fontSize).toBe('medium');

    act(() => {
      result.current.setFontSize('large');
    });

    expect(result.current.fontSize).toBe('large');

    act(() => {
      result.current.setFontSize('small');
    });

    expect(result.current.fontSize).toBe('small');

    act(() => {
      result.current.setFontSize('medium');
    });

    expect(result.current.fontSize).toBe('medium');
  });
});