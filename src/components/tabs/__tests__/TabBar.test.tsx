import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TabBar from '../TabBar';

const tabs = [
  { key: 'recipes', label: 'Рецепты' },
  { key: 'skills', label: 'Скиллы' },
  { key: 'quests', label: 'Квесты' },
];

describe('TabBar', () => {
  it('renders all tabs', () => {
    render(<TabBar tabs={tabs} activeTab="recipes" onTabChange={() => {}} />);
    expect(screen.getByText('Рецепты')).toBeTruthy();
    expect(screen.getByText('Скиллы')).toBeTruthy();
    expect(screen.getByText('Квесты')).toBeTruthy();
  });

  it('calls onTabChange on click', () => {
    const onChange = vi.fn();
    render(<TabBar tabs={tabs} activeTab="recipes" onTabChange={onChange} />);
    fireEvent.click(screen.getByText('Скиллы'));
    expect(onChange).toHaveBeenCalledWith('skills');
  });
});
