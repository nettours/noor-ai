import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdmin } from '../middleware/auth';

export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalPosts, todayUsers] = await Promise.all([
      prisma.user.count(),
      prisma.feedPost.count(),
      prisma.user.count({
        where: { lastActiveAt: { gte: new Date(Date.now() - 86400000) } },
      }),
    ]);
    res.json({ success: true, data: { totalUsers, totalPosts, todayUsers } });
  } catch (err) { next(err); }
});

adminRouter.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, points: true, streak: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
});
