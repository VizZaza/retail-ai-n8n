'use client';

import RequireAuth from '../../components/RequireAuth';
import Page from '../../components/layout/Page';
import { api } from '../../components/api';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function AIPage() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr('');
    try { setItems(await api('/ai/suggestions')); }
    catch (e:any) { setErr(String(e.message||e)); }
  }
  useEffect(()=>{ load(); }, []);

  async function generate() {
    setErr('');
    setLoading(true);
    try {
      await api('/ai/generate-suggestions', { method: 'POST' });
      await load();
    } catch (e:any) { setErr(String(e.message||e)); }
    finally { setLoading(false); }
  }

  return (
    <RequireAuth>
      <Page title="AI Suggestions">
        {err && <div className="text-red-600 text-sm whitespace-pre-wrap">{err}</div>}
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50" disabled={loading} onClick={generate}>
            {loading ? 'Generating...' : 'Generate new suggestions'}
          </button>
          <button className="px-3 py-2 rounded border hover:bg-slate-50" onClick={load}>Refresh</button>
        </div>

        <div className="mt-4 space-y-3">
          {items.map(x => (
            <div key={x.id} className="bg-white border rounded-2xl p-4">
              <div className="flex items-baseline justify-between">
                <div className="font-medium">Generated</div>
                <div className="text-sm text-slate-600">{dayjs(x.createdAt).format('DD/MM/YYYY HH:mm')}</div>
              </div>
              <pre className="mt-3 text-sm whitespace-pre-wrap bg-slate-50 border rounded p-3">{x.summary}</pre>
            </div>
          ))}
          {items.length === 0 ? <div className="text-sm text-slate-600">No suggestions yet.</div> : null}
        </div>
      </Page>
    </RequireAuth>
  );
}
