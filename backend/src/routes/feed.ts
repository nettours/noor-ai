import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const feedRouter = Router();

feedRouter.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const posts = await prisma.feedPost.findMany({
      where: { isVisible: true },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    res.json({ success: true, data: posts });
  } catch (err) { next(err); }
});

feedRouter.post('/', async (req, res, next) => {
  try {
    const { content, type, tags } = req.body;
    const post = await prisma.feedPost.create({
      data: { userId: req.user!.id, content, type, tags: tags || [] },
    });
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
});
