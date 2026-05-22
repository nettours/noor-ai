import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const notificationsRouter = Router();

notificationsRouter.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
});

notificationsRouter.patch('/:id/read', async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true, readAt: new Date() },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

notificationsRouter.post('/subscribe', async (req, res, next) => {
  try {
    const { subscription } = req.body;
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { keys: subscription.keys, userId: req.user!.id },
      create: { userId: req.user!.id, endpoint: subscription.endpoint, keys: subscription.keys },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});
