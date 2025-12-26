'use client';

import RequireAuth from '../../components/RequireAuth';
import Page from '../../components/layout/Page';
import { api } from '../../components/api';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

export default function SalesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<{productId: string; qty: number}[]>([]);

  async function load() {
    setErr('');
    try {
      setProducts(await api('/products'));
      setOrders(await api('/sales/orders'));
    } catch (e:any) { setErr(String(e.message||e)); }
  }
  useEffect(()=>{ load(); }, []);

  function addItem() { setItems([...items, { productId: '', qty: 1 }]); }

  async function createOrder() {
    setErr('');
    try {
      const valid = items.filter(i => i.productId && i.qty > 0);
      if (valid.length === 0) throw new Error('Add at least 1 item');
      await api('/sales/orders', { method: 'POST', body: JSON.stringify({ customerName: customerName || undefined, items: valid }) });
      setCustomerName('');
      setItems([]);
      await load();
      alert('Order created!');
    } catch (e:any) { setErr(String(e.message||e)); }
  }

  const orderCount = useMemo(()=>orders.length, [orders]);
  const todayRevenue = useMemo(()=>{
    const today = dayjs().format('YYYY-MM-DD');
    return orders.filter(o=>dayjs(o.createdAt).format('YYYY-MM-DD')===today).reduce((s,o)=>s+o.total,0);
  }, [orders]);

  return (
    <RequireAuth>
      <Page title="Sales">
        {err && <div className="text-red-600 text-sm whitespace-pre-wrap">{err}</div>}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-2xl p-4 md:col-span-1">
            <div className="font-medium">Create order</div>
            <div className="mt-3 space-y-2 text-sm">
              <input className="w-full border rounded px-3 py-2" placeholder="Customer name (optional)" value={customerName} onChange={e=>setCustomerName(e.target.value)} />
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-2">
                    <select className="col-span-4 border rounded px-2 py-2" value={it.productId} onChange={e=>{
                      const v = e.target.value; setItems(items.map((x,i)=>i===idx?{...x, productId:v}:x));
                    }}>
                      <option value="">Select</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock {p.stock})</option>)}
                    </select>
                    <input className="col-span-2 border rounded px-2 py-2" type="number" min={1} value={it.qty} onChange={e=>{
                      const v = Number(e.target.value); setItems(items.map((x,i)=>i===idx?{...x, qty:v}:x));
                    }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded border hover:bg-slate-50" onClick={addItem}>+ Item</button>
                <button className="flex-1 px-3 py-2 rounded bg-slate-900 text-white hover:bg-slate-800" onClick={createOrder}>Create</button>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-4 md:col-span-2">
            <div className="flex items-baseline justify-between">
              <div className="font-medium">Recent orders</div>
              <div className="text-sm text-slate-600">Total: {orderCount} • Today: {todayRevenue.toLocaleString()} VND</div>
            </div>
            <div className="mt-3 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-600">
                  <tr>
                    <th className="py-2">Order</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-t">
                      <td className="py-2">{o.orderNo}</td>
                      <td>{dayjs(o.createdAt).format('DD/MM HH:mm')}</td>
                      <td>{Number(o.total).toLocaleString()}</td>
                      <td className="max-w-[420px] truncate">
                        {(o.items||[]).map((it:any)=>`${it.product?.name}×${it.qty}`).join(', ')}
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
