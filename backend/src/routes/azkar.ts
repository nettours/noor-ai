import { Router } from 'express';

export const azkarRouter = Router();
azkarRouter.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'Use client-side azkar data' } });
});
