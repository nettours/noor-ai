import { Router } from 'express';
import { chat, detectMood, generateKhutbah, generateDailyPlan, tafsir } from '../controllers/ai.controller';

export const aiRouter = Router();
aiRouter.post('/chat', chat);
aiRouter.post('/detect-mood', detectMood);
aiRouter.post('/khutbah', generateKhutbah);
aiRouter.post('/daily-plan', generateDailyPlan);
aiRouter.post('/tafsir', tafsir);
