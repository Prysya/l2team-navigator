import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import MainPage from '../MainPage';

describe('MainPage', () => {
  it('renders subtitle and 7 section cards', () => {
    render(<BrowserRouter><MainPage /></BrowserRouter>);
    expect(screen.getByText('Выберите раздел')).toBeTruthy();
    expect(screen.getByText('Рецепты')).toBeTruthy();
    expect(screen.getByText('Квесты')).toBeTruthy();
  });

  it('easter egg appears on iddqd input', () => {
    render(<BrowserRouter><MainPage /></BrowserRouter>);
    expect(screen.queryByText('Саша Ролекс Пес')).toBeNull();
    fireEvent.keyDown(window, { key: 'i' });
    fireEvent.keyDown(window, { key: 'd' });
    fireEvent.keyDown(window, { key: 'd' });
    fireEvent.keyDown(window, { key: 'q' });
    fireEvent.keyDown(window, { key: 'd' });
    expect(screen.getByText('Саша Ролекс Пес')).toBeTruthy();
  });

  it('closes easter egg on overlay click', () => {
    render(<BrowserRouter><MainPage /></BrowserRouter>);
    fireEvent.keyDown(window, { key: 'i' });
    fireEvent.keyDown(window, { key: 'd' });
    fireEvent.keyDown(window, { key: 'd' });
    fireEvent.keyDown(window, { key: 'q' });
    fireEvent.keyDown(window, { key: 'd' });
    const close = screen.getByText('✕');
    fireEvent.click(close);
    expect(screen.queryByText('Саша Ролекс Пес')).toBeNull();
  });
});
