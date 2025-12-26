import type { Request, Response, NextFunction } from 'express';
import { env } from '../lib/env.js';
import { verifyToken } from '../lib/auth.js';

export function authRequired(req: Request, res: Response, next: NextFunction) {
  // Allow internal calls from n8n etc.
  const internal = req.header('x-internal-api-key');
  if (internal && internal === env.INTERNAL_API_KEY) return next();

  const auth = req.header('authorization') || '';
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing Bearer token' });
  }
  try {
    (req as any).user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
