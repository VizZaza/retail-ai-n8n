import { Router } from 'express';
import { z } from 'zod';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma.js';

export const salesRouter = Router();

salesRouter.get('/sales/orders', async (_req, res) => {
  const orders = await prisma.saleOrder.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(orders);
});

salesRouter.post('/sales/orders', async (req, res) => {
  const body = z.object({
    customerName: z.string().optional(),
    items: z.array(z.object({
      productId: z.string().uuid(),
      qty: z.number().int().positive(),
      unitPrice: z.number().int().positive().optional()
    })).min(1),
  }).safeParse(req.body);

  if (!body.success) return res.status(400).json({ error: body.error.flatten() });

  const now = new Date();
  const orderNo = `SO-${dayjs(now).format('YYYYMMDD-HHmmss')}-${Math.floor(Math.random()*1000)}`;

  const result = await prisma.$transaction(async (tx) => {
    // fetch products
    const products = await tx.product.findMany({
      where: { id: { in: body.data.items.map(i => i.productId) } }
    });
    const map = new Map(products.map(p => [p.id, p]));

    let total = 0;
    const itemsData = body.data.items.map(i => {
      const p = map.get(i.productId);
      if (!p) throw new Error(`Product not found: ${i.productId}`);
      const unitPrice = i.unitPrice ?? p.price;
      const lineTotal = unitPrice * i.qty;
      total += lineTotal;
      return { productId: i.productId, qty: i.qty, unitPrice, lineTotal };
    });

    // deduct stock + inventory tx
    for (const i of itemsData) {
      await tx.product.update({
        where: { id: i.productId },
        data: { stock: { decrement: i.qty } },
      });
      await tx.inventoryTx.create({
        data: { productId: i.productId, delta: -i.qty, reason: `Sale ${orderNo}` }
      });
    }

    const order = await tx.saleOrder.create({
      data: {
        orderNo,
        customerName: body.data.customerName,
        total,
        items: { create: itemsData }
      },
      include: { items: { include: { product: true } } }
    });

    return order;
  });

  res.json(result);
});
