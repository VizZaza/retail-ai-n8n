import { Router } from 'express';
import dayjs from 'dayjs';
import axios from 'axios';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';

export const aiRouter = Router();

function range14days() {
  const to = dayjs().endOf('day');
  const from = to.subtract(14, 'day').startOf('day');
  return { from: from.toDate(), to: to.toDate() };
}

async function computeHeuristic(from: Date, to: Date) {
  // total qty by product
  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT p.id, p.sku, p.name, p.stock, p."reorderPoint",
           COALESCE(SUM(i.qty),0) AS qty14
    FROM "Product" p
    LEFT JOIN "SaleOrderItem" i ON i."productId" = p.id
    LEFT JOIN "SaleOrder" o ON o.id = i."orderId" AND o."createdAt" BETWEEN $1 AND $2
    GROUP BY p.id
    ORDER BY qty14 DESC
  `, from, to);

  const days = 14;
  const suggestions = rows.map(r => {
    const avgDaily = Number(r.qty14) / days;
    const stock = Number(r.stock);
    const reorderPoint = Number(r.reorderPoint);
    const daysCover = avgDaily > 0 ? stock / avgDaily : 9999;
    const need = stock <= reorderPoint || daysCover < 7;

    // want 30 days cover
    const target = Math.ceil(avgDaily * 30);
    const reorderQty = Math.max(0, target - stock);

    return {
      productId: r.id,
      sku: r.sku,
      name: r.name,
      stock,
      reorderPoint,
      avgDaily: Number(avgDaily.toFixed(2)),
      daysCover: Number(daysCover.toFixed(1)),
      need,
      reorderQty
    };
  });

  const prioritized = suggestions
    .filter(s => s.need && s.reorderQty > 0)
    .sort((a,b) => a.daysCover - b.daysCover)
    .slice(0, 15);

  return { from, to, prioritized, all: suggestions };
}

async function aiSummarize(payload: any) {
  if (!env.OPENAI_API_KEY) {
    const top = payload.prioritized.slice(0, 5);
    const lines = top.map((x: any, i: number) =>
      `${i+1}. ${x.name} (${x.sku}) - stock ${x.stock}, avg/day ${x.avgDaily}, cover ${x.daysCover} days → reorder ${x.reorderQty}`
    );
    return `AI (fallback) gợi ý nhập hàng dựa trên 14 ngày bán gần nhất:
` + lines.join('
');
  }

  const prompt = `Bạn là trợ lý quản lý hàng tồn kho. Dưới đây là dữ liệu bán 14 ngày gần nhất và tồn kho hiện tại.
Hãy viết 1 đoạn tóm tắt ngắn (5-8 dòng) và danh sách 5 sản phẩm cần nhập gấp nhất (ưu tiên hết hàng sớm).
Trả lời tiếng Việt, rõ ràng, có số lượng nhập đề xuất.

Dữ liệu JSON:
${JSON.stringify(payload.prioritized.slice(0, 15), null, 2)}
`;

  const url = `${env.OPENAI_BASE_URL.replace(/\/$/, '')}/chat/completions`;
  const resp = await axios.post(url, {
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'Bạn là trợ lý quản trị bán lẻ.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2
  }, {
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` }
  });

  const text = resp.data?.choices?.[0]?.message?.content;
  return String(text || '').trim() || 'No AI output';
}

aiRouter.get('/ai/suggestions', async (_req, res) => {
  const items = await prisma.aISuggestion.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  res.json(items);
});

aiRouter.post('/ai/generate-suggestions', async (_req, res) => {
  const { from, to } = range14days();
  const payload = await computeHeuristic(from, to);
  const summary = await aiSummarize(payload);

  const created = await prisma.aISuggestion.create({
    data: { fromDate: from, toDate: to, payload, summary }
  });

  res.json(created);
});
