import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import TabIcon from '../TabIcon';

describe('TabIcon', () => {
  it('renders SVG for valid tab key', () => {
    const { container } = render(<TabIcon tab="recipes" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('returns null for unknown tab key', () => {
    const { container } = render(<TabIcon tab="unknown" />);
    expect(container.querySelector('svg')).toBeFalsy();
  });

  it('applies className', () => {
    const { container } = render(<TabIcon tab="skills" className="test-class" />);
    expect(container.querySelector('.test-class')).toBeTruthy();
  });
});
