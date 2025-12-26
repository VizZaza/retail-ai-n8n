import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export const inventoryRouter = Router();

inventoryRouter.post('/inventory/adjust', async (req, res) => {
  const body = z.object({
    productId: z.string().uuid(),
    delta: z.number().int(),
    reason: z.string().min(1),
  }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.flatten() });

  const { productId, delta, reason } = body.data;
  const updated = await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id: productId },
      data: { stock: { increment: delta } },
    });
    await tx.inventoryTx.create({ data: { productId, delta, reason } });
    return product;
  });

  res.json(updated);
});
