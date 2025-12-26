'use client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export async function api(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      'content-type': 'application/json',
      ...(opts.headers || {}),
      ...(token ? { authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.blob();
}
