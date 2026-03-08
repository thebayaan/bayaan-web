import { render, screen, fireEvent } from '@testing-library/react';
import { TranslationToggle } from '@/components/translations/TranslationToggle';
import { useTranslationStore } from '@/stores/useTranslationStore';

describe('TranslationToggle', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useTranslationStore.setState({
      selectedTranslation: 'saheeh',
      showTranslations: false,
      translationPosition: 'below',
      fontSize: 'medium',
    });
  });

  test('should render toggle button', () => {
    render(<TranslationToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should have correct accessibility label when translations hidden', () => {
    render(<TranslationToggle />);
    const button = screen.getByLabelText('Show Translation');
    expect(button).toBeInTheDocument();
  });

  test('should have correct accessibility label when translations shown', () => {
    // Set translations to shown
    useTranslationStore.setState({ showTranslations: true });

    render(<TranslationToggle />);
    const button = screen.getByLabelText('Hide Translation');
    expect(button).toBeInTheDocument();
  });

  test('should toggle translations when clicked', () => {
    render(<TranslationToggle />);
    const button = screen.getByRole('button');

    // Initially should be hidden
    expect(useTranslationStore.getState().showTranslations).toBe(false);

    // Click to show
    fireEvent.click(button);
    expect(useTranslationStore.getState().showTranslations).toBe(true);

    // Click to hide
    fireEvent.click(button);
    expect(useTranslationStore.getState().showTranslations).toBe(false);
  });
});