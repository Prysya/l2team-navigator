import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CalculatorTab from '../CalculatorTab';

describe('CalculatorTab', () => {
  it('renders title', () => {
    render(<BrowserRouter><CalculatorTab /></BrowserRouter>);
    const titles = screen.getAllByText('Калькулятор опыта');
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it('renders floating nav', () => {
    render(<BrowserRouter><CalculatorTab /></BrowserRouter>);
    expect(screen.getByText('Пенальти')).toBeTruthy();
    expect(screen.getByText('Советы')).toBeTruthy();
  });
});
