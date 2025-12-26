import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export const productsRouter = Router();

productsRouter.get('/products', async (req, res) => {
  const q = (req.query.q as string | undefined)?.trim();
  const items = await prisma.product.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { sku: { contains: q, mode: 'insensitive' } }] }
      : undefined,
    orderBy: { updatedAt: 'desc' },
  });
  res.json(items);
});

productsRouter.post('/products', async (req, res) => {
  const body = z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    category: z.string().optional(),
    price: z.number().int().nonnegative(),
    cost: z.number().int().nonnegative().optional(),
    stock: z.number().int().optional(),
    reorderPoint: z.number().int().optional(),
  }).safeParse(req.body);

  if (!body.success) return res.status(400).json({ error: body.error.flatten() });

  const item = await prisma.product.create({ data: body.data });
  res.json(item);
});

productsRouter.put('/products/:id', async (req, res) => {
  const body = z.object({
    sku: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    category: z.string().nullable().optional(),
    price: z.number().int().nonnegative().optional(),
    cost: z.number().int().nonnegative().nullable().optional(),
    stock: z.number().int().optional(),
    reorderPoint: z.number().int().optional(),
  }).safeParse(req.body);

  if (!body.success) return res.status(400).json({ error: body.error.flatten() });

  const item = await prisma.product.update({ where: { id: req.params.id }, data: body.data as any });
  res.json(item);
});

productsRouter.delete('/products/:id', async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
