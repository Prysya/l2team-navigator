import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders message', () => {
    render(<EmptyState message="Nothing found" />);
    expect(screen.getByText('Nothing found')).toBeTruthy();
  });

  it('renders icon when provided', () => {
    render(<EmptyState message="Not found" icon="🔍" />);
    expect(screen.getByText('🔍')).toBeTruthy();
  });

  it('renders without icon', () => {
    const { container } = render(<EmptyState message="Empty" />);
    expect(container.querySelector('p')?.textContent).toBe('Empty');
  });
});
