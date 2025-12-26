'use client';

import RequireAuth from '../../components/RequireAuth';
import Page from '../../components/layout/Page';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { api } from '../../components/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [err, setErr] = useState('');

  const from = useMemo(() => dayjs().subtract(7, 'day').format('YYYY-MM-DD'), []);
  const to = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await api(`/reports/revenue?from=${from}&to=${to}`);
        const p = await api(`/products`);
        setReport(r);
        setProducts(p);
      } catch (e: any) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [from, to]);

  const low = products.filter(p => p.stock <= p.reorderPoint).slice(0, 8);

  return (
    <RequireAuth>
      <Page title="Dashboard">
        {err && <div className="text-red-600 text-sm whitespace-pre-wrap">{err}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border rounded-2xl p-4 md:col-span-2">
              <div className="flex items-baseline justify-between">
                <div className="font-medium">Revenue (7 days)</div>
                <div className="text-sm text-slate-600">{from} → {to}</div>
              </div>
              <div className="text-2xl font-semibold mt-2">{(report?.totalRevenue ?? 0).toLocaleString()} VND</div>
              <div className="h-56 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={(report?.series || []).map((x:any)=>({ day: dayjs(x.day).format('DD/MM'), revenue: x.revenue }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-4">
              <div className="font-medium">Low stock</div>
              <div className="text-sm text-slate-600 mt-1">Products at/below reorder point</div>
              <div className="mt-3 space-y-2">
                {low.length === 0 ? <div className="text-sm text-slate-600">No low stock 🎉</div> : null}
                {low.map(p => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <div className="truncate pr-3">{p.name}</div>
                    <div className="font-medium">{p.stock}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-4 md:col-span-3">
              <div className="font-medium">Quick actions</div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <a className="px-3 py-2 rounded border hover:bg-slate-50" href="/products">Manage products</a>
                <a className="px-3 py-2 rounded border hover:bg-slate-50" href="/inventory">Adjust inventory</a>
                <a className="px-3 py-2 rounded border hover:bg-slate-50" href="/sales">Create sales order</a>
                <a className="px-3 py-2 rounded border hover:bg-slate-50" href="/ai">Generate AI suggestions</a>
              </div>
            </div>
          </div>
        )}
      </Page>
    </RequireAuth>
  );
}
