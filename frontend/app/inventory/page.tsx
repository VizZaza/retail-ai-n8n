'use client';

import RequireAuth from '../../components/RequireAuth';
import Page from '../../components/layout/Page';
import { api } from '../../components/api';
import { useEffect, useState } from 'react';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [productId, setProductId] = useState('');
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState('Manual adjust');

  async function load() {
    setErr('');
    try { setProducts(await api('/products')); } catch (e:any) { setErr(String(e.message||e)); }
  }
  useEffect(()=>{ load(); }, []);

  async function adjust() {
    setErr('');
    try {
      await api('/inventory/adjust', { method: 'POST', body: JSON.stringify({ productId, delta: Number(delta), reason }) });
      setDelta(0);
      setReason('Manual adjust');
      await load();
      alert('Updated!');
    } catch (e:any) { setErr(String(e.message||e)); }
  }

  return (
    <RequireAuth>
      <Page title="Inventory">
        {err && <div className="text-red-600 text-sm whitespace-pre-wrap">{err}</div>}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-2xl p-4">
            <div className="font-medium">Adjust stock</div>
            <div className="mt-3 space-y-2 text-sm">
              <select className="w-full border rounded px-3 py-2" value={productId} onChange={e=>setProductId(e.target.value)}>
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}
              </select>
              <input className="w-full border rounded px-3 py-2" type="number" value={delta} onChange={e=>setDelta(Number(e.target.value))} placeholder="Delta (+/-)" />
              <input className="w-full border rounded px-3 py-2" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason" />
              <button className="w-full rounded bg-slate-900 text-white py-2 hover:bg-slate-800 disabled:opacity-50" disabled={!productId} onClick={adjust}>
                Apply
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-4 md:col-span-2">
            <div className="flex items-baseline justify-between">
              <div className="font-medium">Current stock</div>
              <button className="text-sm px-3 py-1 rounded border hover:bg-slate-50" onClick={load}>Refresh</button>
            </div>
            <div className="mt-3 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-600">
                  <tr>
                    <th className="py-2">SKU</th>
                    <th>Name</th>
                    <th>Stock</th>
                    <th>Reorder</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2">{p.sku}</td>
                      <td className="max-w-[360px] truncate">{p.name}</td>
                      <td className={p.stock <= p.reorderPoint ? 'text-red-600 font-medium' : ''}>{p.stock}</td>
                      <td>{p.reorderPoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </Page>
    </RequireAuth>
  );
}
