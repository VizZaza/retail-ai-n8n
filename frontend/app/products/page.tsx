'use client';

import RequireAuth from '../../components/RequireAuth';
import Page from '../../components/layout/Page';
import { api } from '../../components/api';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ sku: '', name: '', category: '', price: 0, cost: 0, stock: 0, reorderPoint: 10 });

  async function load() {
    setErr('');
    try { setItems(await api('/products')); } catch (e:any) { setErr(String(e.message||e)); }
  }
  useEffect(() => { load(); }, []);

  async function create() {
    try {
      await api('/products', { method: 'POST', body: JSON.stringify({
        sku: form.sku, name: form.name, category: form.category || undefined,
        price: Number(form.price), cost: Number(form.cost) || undefined,
        stock: Number(form.stock), reorderPoint: Number(form.reorderPoint)
      })});
      setForm({ sku: '', name: '', category: '', price: 0, cost: 0, stock: 0, reorderPoint: 10 });
      await load();
    } catch (e:any) { setErr(String(e.message||e)); }
  }

  async function del(id: string) {
    if (!confirm('Delete this product?')) return;
    try { await api(`/products/${id}`, { method: 'DELETE' }); await load(); }
    catch (e:any) { setErr(String(e.message||e)); }
  }

  async function quickEdit(p: any) {
    const name = prompt('New name', p.name);
    if (!name) return;
    try { await api(`/products/${p.id}`, { method: 'PUT', body: JSON.stringify({ name })}); await load(); }
    catch (e:any) { setErr(String(e.message||e)); }
  }

  return (
    <RequireAuth>
      <Page title="Products">
        {err && <div className="text-red-600 text-sm whitespace-pre-wrap">{err}</div>}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-2xl p-4">
            <div className="font-medium">Add product</div>
            <div className="mt-3 space-y-2 text-sm">
              <input className="w-full border rounded px-3 py-2" placeholder="SKU" value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} />
              <input className="w-full border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
              <input className="w-full border rounded px-3 py-2" placeholder="Category" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
              <input className="w-full border rounded px-3 py-2" placeholder="Price (VND)" type="number" value={form.price} onChange={e=>setForm({...form, price: Number(e.target.value)})} />
              <input className="w-full border rounded px-3 py-2" placeholder="Cost (VND)" type="number" value={form.cost} onChange={e=>setForm({...form, cost: Number(e.target.value)})} />
              <div className="grid grid-cols-2 gap-2">
                <input className="w-full border rounded px-3 py-2" placeholder="Stock" type="number" value={form.stock} onChange={e=>setForm({...form, stock: Number(e.target.value)})} />
                <input className="w-full border rounded px-3 py-2" placeholder="Reorder point" type="number" value={form.reorderPoint} onChange={e=>setForm({...form, reorderPoint: Number(e.target.value)})} />
              </div>
              <button className="w-full rounded bg-slate-900 text-white py-2 hover:bg-slate-800" onClick={create}>
                Create
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-4 md:col-span-2">
            <div className="flex items-baseline justify-between">
              <div className="font-medium">List</div>
              <button className="text-sm px-3 py-1 rounded border hover:bg-slate-50" onClick={load}>Refresh</button>
            </div>
            <div className="mt-3 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-600">
                  <tr>
                    <th className="py-2">SKU</th>
                    <th>Name</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Reorder</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2">{p.sku}</td>
                      <td className="max-w-[280px] truncate">{p.name}</td>
                      <td className={p.stock <= p.reorderPoint ? 'text-red-600 font-medium' : ''}>{p.stock}</td>
                      <td>{Number(p.price).toLocaleString()}</td>
                      <td>{p.reorderPoint}</td>
                      <td className="text-right space-x-2">
                        <button className="px-2 py-1 rounded border hover:bg-slate-50" onClick={()=>quickEdit(p)}>Edit</button>
                        <button className="px-2 py-1 rounded border hover:bg-slate-50" onClick={()=>del(p.id)}>Delete</button>
                      </td>
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
