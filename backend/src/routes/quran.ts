import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const quranRouter = Router();

quranRouter.post('/progress', async (req, res) => {
  res.json({ success: true });
});

quranRouter.post('/bookmark', async (req, res, next) => {
  try {
    const { surahNumber, ayahNumber, note } = req.body;
    const userId = (req as any).user?.id;
    if (!userId) return res.json({ success: true });
    await prisma.bookmark.upsert({
      where: { userId_surahNumber_ayahNumber: { userId, surahNumber, ayahNumber } },
      update: { note },
      create: { userId, surahNumber, ayahNumber, note },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});
