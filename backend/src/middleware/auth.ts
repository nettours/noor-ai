// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'غير مصرح' });

    const userId = verifyToken(token);

    // Try cache first
    try {
      const cached = await redis.get(`user:${userId}`);
      if (cached) {
        req.user = JSON.parse(cached);
        return next();
      }
    } catch {}

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) return res.status(401).json({ success: false, error: 'المستخدم غير موجود' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'رمز غير صالح' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'غير مسموح' });
  }
  next();
}
