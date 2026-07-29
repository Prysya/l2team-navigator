import axios from 'axios';

const API_URL = import.meta.env.VITE_TELEGRAM_API_URL;
const API_TOKEN = import.meta.env.VITE_TELEGRAM_API_TOKEN;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {},
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

function fmtAxiosError(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : String(err);
  }
  if (err.response) {
    const data =
      typeof err.response.data === 'string'
        ? err.response.data.slice(0, 500)
        : JSON.stringify(err.response.data).slice(0, 500);
    return `HTTP ${err.response.status}: ${data}`;
  }
  if (err.request) {
    return `Network error: ${err.message}`;
  }
  return err.message;
}

export async function checkClanMembership(id: number, username: string | null): Promise<CheckUserResponse> {
  if (!API_URL || !API_TOKEN) {
    return { isL2teamUser: false, error: 'API not configured' };
  }

  try {
    const { data } = await api.post<CheckUserResponse>('/api/check-user', { id, username });
    return data;
  } catch (err) {
    return { isL2teamUser: false, error: fmtAxiosError(err) };
  }
}

export async function sendBossText(text: string): Promise<SendBossResponse> {
  if (!API_URL || !API_TOKEN) {
    return { ok: false, error: 'API not configured' };
  }

  try {
    const { data } = await api.post<SendBossResponse>('/api/send-boss', { text });
    return data;
  } catch (err) {
    return { ok: false, error: fmtAxiosError(err) };
  }
}
