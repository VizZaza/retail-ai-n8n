import { Router } from 'express';
import dayjs from 'dayjs';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma.js';

export const reportsRouter = Router();

function parseRange(qFrom?: string, qTo?: string) {
  const to = qTo ? dayjs(qTo) : dayjs();
  const from = qFrom ? dayjs(qFrom) : to.subtract(7, 'day');
  return { from: from.startOf('day').toDate(), to: to.endOf('day').toDate() };
}

reportsRouter.get('/reports/revenue', async (req, res) => {
  const { from, to } = parseRange(req.query.from as any, req.query.to as any);

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT date_trunc('day',"createdAt") AS day, SUM(total) AS revenue
    FROM "SaleOrder"
    WHERE "createdAt" BETWEEN $1 AND $2
    GROUP BY 1
    ORDER BY 1 ASC
  `, from, to);

  const totalRow = await prisma.$queryRawUnsafe<any[]>(`
    SELECT COALESCE(SUM(total),0) AS revenue
    FROM "SaleOrder"
    WHERE "createdAt" BETWEEN $1 AND $2
  `, from, to);

  res.json({
    from,
    to,
    totalRevenue: Number(totalRow?.[0]?.revenue ?? 0),
    series: rows.map(r => ({ day: r.day, revenue: Number(r.revenue) }))
  });
});

reportsRouter.get('/reports/low-stock', async (_req, res) => {
  const items = await prisma.$queryRawUnsafe<any[]>(`
    SELECT *
    FROM "Product"
    WHERE stock <= "reorderPoint"
    ORDER BY stock ASC, name ASC
  `);
  res.json(items);
});

reportsRouter.get('/reports/revenue.pdf'
, async (req, res) => {
  const { from, to } = parseRange(req.query.from as any, req.query.to as any);

  const revenue = await prisma.$queryRawUnsafe<any[]>(`
    SELECT date_trunc('day',"createdAt") AS day, SUM(total) AS revenue
    FROM "SaleOrder"
    WHERE "createdAt" BETWEEN $1 AND $2
    GROUP BY 1
    ORDER BY 1 ASC
  `, from, to);

  const top = await prisma.$queryRawUnsafe<any[]>(`
    SELECT p.name, SUM(i.qty) AS qty, SUM(i."lineTotal") AS revenue
    FROM "SaleOrderItem" i
    JOIN "SaleOrder" o ON o.id = i."orderId"
    JOIN "Product" p ON p.id = i."productId"
    WHERE o."createdAt" BETWEEN $1 AND $2
    GROUP BY p.name
    ORDER BY revenue DESC
    LIMIT 10
  `, from, to);

  const labels = revenue.map(r => dayjs(r.day).format('DD/MM'));
  const data = revenue.map(r => Number(r.revenue));
  const chartConfig = {
    type: 'line',
    data: { labels, datasets: [{ label: 'Revenue (VND)', data }] },
    options: { plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true } } }
  };

  const chartUrl = "https://quickchart.io/chart?width=800&height=300&c=" + encodeURIComponent(JSON.stringify(chartConfig));
  const img = await axios.get(chartUrl, { responseType: 'arraybuffer' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="revenue-${dayjs(from).format('YYYYMMDD')}-${dayjs(to).format('YYYYMMDD')}.pdf"`);

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.pipe(res);

  doc.fontSize(18).text('Retail Revenue Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Range: ${dayjs(from).format('YYYY-MM-DD')} → ${dayjs(to).format('YYYY-MM-DD')}`, { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(12).text('Revenue chart');
  doc.image(img.data, { fit: [520, 220], align: 'center' });
  doc.moveDown(1);

  doc.fontSize(12).text('Top 10 products');
  doc.moveDown(0.5);

  const startX = 40;
  let y = doc.y;
  doc.fontSize(10);
  doc.text('Product', startX, y);
  doc.text('Qty', startX + 320, y);
  doc.text('Revenue', startX + 400, y);
  y += 14;
  doc.moveTo(startX, y).lineTo(startX + 520, y).stroke();
  y += 8;

  for (const r of top) {
    doc.text(String(r.name), startX, y, { width: 300 });
    doc.text(String(r.qty), startX + 320, y);
    doc.text(String(r.revenue), startX + 400, y);
    y += 14;
    if (y > 760) { doc.addPage(); y = 40; }
  }

  doc.end();
});
