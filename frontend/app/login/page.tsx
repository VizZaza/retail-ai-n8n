'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../components/api';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@local');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit() {
    setErr('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white border rounded-2xl shadow-sm w-full max-w-md p-6">
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="text-sm text-slate-600 mt-1">Admin login (demo)</p>

        <div className="mt-5 space-y-3">
          <div>
            <div className="text-sm font-medium">Email</div>
            <input className="mt-1 w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <div className="text-sm font-medium">Password</div>
            <input className="mt-1 w-full border rounded px-3 py-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {err && <div className="text-sm text-red-600 whitespace-pre-wrap">{err}</div>}
          <button
            className="w-full rounded bg-slate-900 text-white py-2 hover:bg-slate-800 disabled:opacity-50"
            disabled={loading}
            onClick={submit}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
