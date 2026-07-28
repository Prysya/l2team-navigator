import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Toast from '../Toast';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Toast', () => {
  it('renders message', () => {
    render(<Toast message="Test toast" onDone={vi.fn()} />);
    expect(screen.getByText('Test toast')).toBeTruthy();
  });

  it('calls onDone after duration + animation', () => {
    const onDone = vi.fn();
    render(<Toast message="Test" onDone={onDone} duration={1000} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onDone).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('accepts custom duration', () => {
    const onDone = vi.fn();
    render(<Toast message="Test" onDone={onDone} duration={500} />);

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
