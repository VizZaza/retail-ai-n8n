import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/auth.js';

export const authRouter = Router();

authRouter.post('/auth/login', async (req, res) => {
  const body = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }).safeParse(req.body);

  if (!body.success) return res.status(400).json({ error: body.error.flatten() });

  const user = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (!user || user.password !== body.data.password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ uid: user.id, email: user.email, role: user.role });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});
