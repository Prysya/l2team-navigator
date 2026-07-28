const API_URL = import.meta.env.VITE_TELEGRAM_API_URL;
const API_TOKEN = import.meta.env.VITE_TELEGRAM_API_TOKEN;

export interface CheckUserResponse {
  isL2teamUser: boolean;
  error?: string;
}

export interface SendMessageResponse {
  ok: boolean;
  error?: string;
}

export async function checkClanMembership(id: number, username: string | null): Promise<CheckUserResponse> {
  if (!API_URL || !API_TOKEN) {
    return { isL2teamUser: false, error: 'API not configured' };
  }

  const res = await fetch(`${API_URL}/api/check-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({ id, username }),
  });

  return res.json() as Promise<CheckUserResponse>;
}

export async function sendMessageToBot(text: string): Promise<SendMessageResponse> {
  if (!API_URL || !API_TOKEN) {
    return { ok: false, error: 'API not configured' };
  }

  const res = await fetch(`${API_URL}/api/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({ text }),
  });

  return res.json() as Promise<SendMessageResponse>;
}
