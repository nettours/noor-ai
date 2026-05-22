import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const prayerRouter = Router();

prayerRouter.post('/tracker', async (req, res, next) => {
  try {
    const { date, prayer, completed } = req.body;
    const userId = (req as any).user?.id;
    if (!userId) return res.json({ success: true });
    const d = new Date(date);
    await prisma.prayerTracker.upsert({
      where: { userId_date: { userId, date: d } },
      update: { [prayer.toLowerCase()]: completed },
      create: { userId, date: d, [prayer.toLowerCase()]: completed },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});
