import axios from 'axios';

const API_URL = import.meta.env.VITE_TELEGRAM_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
});

export interface CheckUserResponse {
  isL2teamUser: boolean;
  error?: string;
}

export interface SendBossResponse {
  ok: boolean;
  message_id?: number;
  error?: string;
}

function serialiseError(err: unknown): Record<string, unknown> {
  if (!axios.isAxiosError(err)) {
    return {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    };
  }

  return {
    name: err.name,
    message: err.message,
    code: err.code,
    config: err.config
      ? {
          url: err.config.url,
          baseURL: err.config.baseURL,
          method: err.config.method,
          timeout: err.config.timeout,
          headers: err.config.headers,
          data: err.config.data,
        }
      : null,
    response: err.response
      ? {
          status: err.response.status,
          statusText: err.response.statusText,
          headers: err.response.headers,
          data: err.response.data,
        }
      : null,
    request: err.request ? '[object]' : null,
    stack: err.stack,
  };
}

function fmtAxiosError(err: unknown): string {
  return JSON.stringify(serialiseError(err), null, 2);
}

export async function checkClanMembership(id: number, username: string | null): Promise<CheckUserResponse> {
  if (!API_URL) {
    return { isL2teamUser: false, error: 'API not configured' };
  }

  try {
    const { data } = await api.post<CheckUserResponse>('/api/check-user', {
      init_data: window.Telegram?.WebApp.initData ?? '',
      id,
      username,
    });
    return data;
  } catch (err) {
    return { isL2teamUser: false, error: fmtAxiosError(err) };
  }
}

export async function sendBossText(text: string): Promise<SendBossResponse> {
  if (!API_URL) {
    return { ok: false, error: 'API not configured' };
  }

  try {
    const { data } = await api.post<SendBossResponse>('/api/send-boss', {
      init_data: window.Telegram?.WebApp.initData ?? '',
      text,
    });
    return data;
  } catch (err) {
    return { ok: false, error: fmtAxiosError(err) };
  }
}
