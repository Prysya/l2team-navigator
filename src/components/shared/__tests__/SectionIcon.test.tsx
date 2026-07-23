import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import SectionIcon from '../SectionIcon';

describe('SectionIcon', () => {
  it("masks the span with the tab's minified svg", () => {
    const { container } = render(<SectionIcon tab="recipes" />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('SPAN');
    // Guards the asset path — it changed during the refactor (.svg -> .min.svg).
    expect(el.getAttribute('style')).toContain('images/sections/recipes.min.svg');
  });

  it('renders nothing for an unknown tab key', () => {
    const { container } = render(<SectionIcon tab="unknown" />);
    expect(container.firstChild).toBeNull();
  });

  it('forwards className', () => {
    const { container } = render(<SectionIcon tab="skills" className="x" />);
    expect((container.firstChild as HTMLElement).classList.contains('x')).toBe(true);
  });

  it('applies an explicit size', () => {
    const { container } = render(<SectionIcon tab="quests" size={20} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('20px');
    expect(el.style.height).toBe('20px');
  });

  it('omits width/height when size is not given (CSS controls it)', () => {
    const { container } = render(<SectionIcon tab="locations" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('');
    expect(el.style.height).toBe('');
  });
});
