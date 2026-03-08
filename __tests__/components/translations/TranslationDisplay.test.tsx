import { render, screen } from '@testing-library/react';
import { TranslationDisplay } from '@/components/translations/TranslationDisplay';

describe('TranslationDisplay', () => {
  test('should render translation text', () => {
    const mockTranslation = {
      verse_key: '1:1',
      text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    };

    render(<TranslationDisplay translation={mockTranslation} />);

    expect(screen.getByText(/In the name of Allah/)).toBeInTheDocument();
  });

  test('should not render when translation is null', () => {
    render(<TranslationDisplay translation={null} />);

    expect(screen.queryByText(/In the name of Allah/)).not.toBeInTheDocument();
  });
});