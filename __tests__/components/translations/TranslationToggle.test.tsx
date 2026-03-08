import { render, screen, fireEvent } from '@testing-library/react';
import { TranslationToggle } from '@/components/translations/TranslationToggle';

// Mock the store
const mockToggleTranslations = jest.fn();
jest.mock('@/stores/useTranslationStore', () => ({
  useTranslationStore: () => ({
    showTranslations: false,
    toggleTranslations: mockToggleTranslations,
  }),
}));

describe('TranslationToggle', () => {
  beforeEach(() => {
    mockToggleTranslations.mockClear();
  });

  test('should render toggle button', () => {
    render(<TranslationToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should call toggle function when clicked', () => {
    render(<TranslationToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockToggleTranslations).toHaveBeenCalledTimes(1);
  });
});