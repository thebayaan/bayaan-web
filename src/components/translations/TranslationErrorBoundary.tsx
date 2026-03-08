'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TranslationErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging purposes
    console.error('Translation component error:', error, errorInfo);

    // You could also send error reports to a logging service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-sm text-[color:var(--color-hint)] italic">
          Translation temporarily unavailable
        </div>
      );
    }

    return this.props.children;
  }
}