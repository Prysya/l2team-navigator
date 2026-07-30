import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(async () => {
  vi.stubEnv('VITE_TELEGRAM_API_URL', '');
  // Clear module cache so telegramApi is loaded with empty API_URL
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  cleanup();
});

async function loadAuthGate() {
  const mod = await import('../AuthGate');
  return mod.default;
}

async function loadAndRender(onAuth: () => void) {
  const AuthGate = await loadAuthGate();
  render(<AuthGate onAuth={onAuth} />);
}

describe('AuthGate', () => {
  it('renders the auth card with title and bot link', async () => {
    await loadAndRender(() => {});

    expect(screen.getByText('L2team Navigator')).toBeTruthy();
    expect(screen.getByText(/Доступ к сайту/i)).toBeTruthy();
    expect(screen.getByText('@l2team_butler_bot')).toBeTruthy();
  });

  it('renders token input and submit button', async () => {
    await loadAndRender(() => {});

    expect(screen.getByPlaceholderText('Введите токен')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Войти/i })).toBeTruthy();
  });

  it('submit button is disabled when input is empty', async () => {
    await loadAndRender(() => {});

    const btn = screen.getByRole('button', { name: /Войти/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('submit button is enabled when input has text', async () => {
    await loadAndRender(() => {});

    const input = screen.getByPlaceholderText('Введите токен');
    fireEvent.change(input, { target: { value: 'some-token' } });

    const btn = screen.getByRole('button', { name: /Войти/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('does not call onAuth when input is empty and form is submitted', async () => {
    const onAuth = vi.fn();
    await loadAndRender(onAuth);

    const btn = screen.getByRole('button', { name: /Войти/i });
    btn.click();

    expect(onAuth).not.toHaveBeenCalled();
  });

  it('shows error message when validate fails', async () => {
    await loadAndRender(() => {});

    const input = screen.getByPlaceholderText('Введите токен');
    fireEvent.change(input, { target: { value: 'bad-token' } });

    const btn = screen.getByRole('button', { name: /Войти/i });
    fireEvent.click(btn);

    const error = await screen.findByText('Неверный или истёкший токен', {}, { timeout: 5000 });
    expect(error).toBeTruthy();
  });

  it('bot link points to correct Telegram bot', async () => {
    await loadAndRender(() => {});

    const link = screen.getByText('@l2team_butler_bot') as HTMLAnchorElement;
    expect(link.href).toBe('https://t.me/l2team_butler_bot');
  });
});
