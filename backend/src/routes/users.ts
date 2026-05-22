import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export const usersRouter = Router();

usersRouter.put('/profile', async (req, res, next) => {
  try {
    const { name, image } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, image },
      select: { id: true, name: true, email: true, image: true },
    });
    await redis.del(`user:${req.user!.id}`);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
});

usersRouter.put('/preferences', async (req, res, next) => {
  try {
    const prefs = await prisma.userPreferences.upsert({
      where: { userId: req.user!.id },
      update: req.body.preferences,
      create: { userId: req.user!.id, ...req.body.preferences },
    });
    await redis.del(`user:${req.user!.id}`);
    res.json({ success: true, data: { preferences: prefs } });
  } catch (err) { next(err); }
});

usersRouter.post('/points', async (req, res, next) => {
  try {
    const { points, reason } = req.body;
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { points: { increment: points } },
    });
    await prisma.pointsHistory.create({
      data: { userId: req.user!.id, amount: points, reason },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});
