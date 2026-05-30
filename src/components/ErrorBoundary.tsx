'use client';

import React from 'react';
import { colors, radius } from '@/theme';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: colors.bg, padding: 24, fontFamily: 'inherit',
        }}>
          <div style={{
            maxWidth: 380, width: '100%', background: colors.surface,
            border: `1px solid ${colors.border}`, borderRadius: radius.md,
            padding: 28, textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: colors.ink, marginBottom: 8 }}>
              Something went wrong
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.ink500, marginBottom: 20, lineHeight: 1.5 }}>
              Please refresh the page. If the problem persists, contact the helpdesk.
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: colors.primary, color: '#fff', border: 'none',
                borderRadius: radius.sm, padding: '12px 24px',
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
