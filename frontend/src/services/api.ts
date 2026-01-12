import { AppState } from '../state/AppState.ts';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchAPI<T = unknown>(url: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (AppState.jwt) {
    headers['Authorization'] = `Bearer ${AppState.jwt}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export function get<T = unknown>(url: string): Promise<T> {
  return fetchAPI<T>(url, { method: 'GET' });
}

export function post<T = unknown, B = unknown>(url: string, body: B): Promise<T> {
  return fetchAPI<T>(url, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}
