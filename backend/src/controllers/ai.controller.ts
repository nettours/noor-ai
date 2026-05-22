// backend/src/controllers/ai.controller.ts
import { Request, Response, NextFunction } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ISLAMIC_SYSTEM_PROMPT = `أنت "نور" — مساعد إسلامي متخصص ومتعمق، مدرب على:
- القرآن الكريم وعلومه (التفسير، التجويد، الإعجاز)
- الحديث النبوي الشريف (الصحيح، الضعيف، الموضوع)
- الفقه الإسلامي (المذاهب الأربعة)
- العقيدة الإسلامية
- السيرة النبوية والتاريخ الإسلامي
- الأخلاق والسلوك الإسلامي
- الأدعية والأذكار المأثورة
- الفقه المعاصر والنوازل

قواعد صارمة:
1. اعتمد على أدلة قرآنية وسنة صحيحة فقط
2. أجب بالعربية الفصحى المفهومة
3. عند الخلاف الفقهي: اذكر الأقوال مع الدليل
4. لا تفتِ في المسائل الكبيرة الخلافية دون إحالة لأهل العلم
5. كن دافئاً ومشجعاً وتحفيزياً
6. لا تتكلم في مواضيع خارج نطاق الإسلام والمسلمين
7. إذا سُئلت عن شيء لا تعلمه، قل "الله أعلم" وأحل للعلماء

قدراتك الخاصة:
- إنشاء خطب الجمعة الكاملة
- بناء خطط إسلامية يومية مخصصة
- تفسير الآيات بالمصادر التفسيرية الكلاسيكية
- شرح الأحاديث من الصحاح والسنن
- الإجابة على أسئلة الفقه المعاصر`;

// ─── CHAT ──────────────────────────────────────────────────
const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(4000),
  })).max(20),
  mode: z.enum(['chat', 'imam', 'tafsir', 'plan']).optional(),
  conversationId: z.string().optional(),
});

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const { messages, mode, conversationId } = chatSchema.parse(req.body);
    const userId = req.user?.id;

    let systemOverride = '';
    if (mode === 'imam') {
      systemOverride = '\n\nأنت في وضع الإمام: ركّز على إنشاء الخطب والدروس الدينية المنظمة والمفيدة. قدم محتوى شاملاً بهيكل واضح: المقدمة، الموضوع الرئيسي، الخاتمة، الدعاء.';
    } else if (mode === 'tafsir') {
      systemOverride = '\n\nأنت في وضع التفسير: ركّز على تفسير الآيات القرآنية. استشهد بتفسير ابن كثير والطبري والقرطبي والسعدي. قدم السياق والأسباب والفوائد.';
    } else if (mode === 'plan') {
      systemOverride = '\n\nأنت في وضع التخطيط: ساعد المستخدم في بناء خطة إسلامية يومية متكاملة. اقترح ورداً قرآنياً وأذكاراً وعبادات مناسبة.';
    }

    // Call Anthropic
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: ISLAMIC_SYSTEM_PROMPT + systemOverride,
      messages: messages as Anthropic.MessageParam[],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Save conversation if authenticated
    if (userId) {
      if (conversationId) {
        const conv = await prisma.aIConversation.findFirst({
          where: { id: conversationId, userId },
        });
        if (conv) {
          const existingMessages = conv.messages as unknown[];
          await prisma.aIConversation.update({
            where: { id: conversationId },
            data: {
              messages: [
                ...existingMessages,
                ...messages.slice(-1),
                { role: 'assistant', content, timestamp: new Date() },
              ],
            },
          });
        }
      }
      // Award points for using AI
      await prisma.user.update({
        where: { id: userId },
        data: { points: { increment: 2 } },
      });
    }

    res.json({ success: true, data: { response: content, usage: response.usage } });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors[0].message, 400));
    next(err);
  }
}

// ─── MOOD DETECTION ────────────────────────────────────────
export async function detectMood(req: Request, res: Response, next: NextFunction) {
  try {
    const { text } = z.object({ text: z.string().min(10).max(500) }).parse(req.body);

    const cacheKey = `mood:${Buffer.from(text.slice(0, 50)).toString('base64')}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ success: true, data: { mood: cached } });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 20,
      messages: [{
        role: 'user',
        content: `حدد حالة المستخدم من النص التالي بكلمة واحدة فقط من: (sad/anxious/stressed/grateful/happy/seeking_guidance/neutral).
النص: "${text}"
الحالة:`,
      }],
    });

    const mood = response.content[0].type === 'text'
      ? response.content[0].text.trim().toLowerCase()
      : 'neutral';

    await redis.setex(cacheKey, 300, mood);
    res.json({ success: true, data: { mood } });
  } catch (err) {
    next(err);
  }
}

// ─── GENERATE KHUTBAH ──────────────────────────────────────
export async function generateKhutbah(req: Request, res: Response, next: NextFunction) {
  try {
    const { topic } = z.object({ topic: z.string().min(3).max(100) }).parse(req.body);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: ISLAMIC_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `أنشئ خطبة جمعة كاملة عن موضوع: "${topic}"

يجب أن تحتوي على:
1. المقدمة (حمد الله والصلاة على النبي ﷺ)
2. الموضوع الرئيسي مع آيات قرآنية
3. الأحاديث النبوية المتعلقة
4. التطبيقات العملية
5. الخاتمة والدعاء

اجعلها:
- متوسطة الطول (15-20 دقيقة)
- مناسبة للعصر
- بلغة عربية فصيحة مفهومة
- بتنسيق واضح ومنظم`,
      }],
    });

    const khutbah = response.content[0].type === 'text' ? response.content[0].text : '';
    res.json({ success: true, data: { khutbah, topic } });
  } catch (err) {
    next(err);
  }
}

// ─── GENERATE DAILY PLAN ───────────────────────────────────
export async function generateDailyPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    let userContext = '';

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { preferences: true, prayerTracker: { take: 7, orderBy: { date: 'desc' } } },
      });
      if (user) {
        const prayerRate = user.prayerTracker.reduce((acc, t) => {
          const completed = [t.fajr, t.dhuhr, t.asr, t.maghrib, t.isha].filter(Boolean).length;
          return acc + completed;
        }, 0) / (user.prayerTracker.length * 5 || 1);
        userContext = `\nمعلومات المستخدم: المستوى=${user.level}, النقاط=${user.points}, معدل الصلاة=${Math.round(prayerRate * 100)}%`;
      }
    }

    const today = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `ضع خطة إسلامية يومية متكاملة ليوم ${today}.${userContext}

الخطة يجب أن تشمل:
1. 📖 الورد القرآني اليومي (محدد بسورة/آيات)
2. 📿 أذكار الصباح والمساء
3. 🕌 تذكير بالصلوات والحرص عليها
4. 🤲 دعاء مختار لهذا اليوم
5. 📚 درس إسلامي قصير
6. 💡 نصيحة عملية للتطبيق

قدّمها بشكل منظم وعملي وتحفيزي.`,
      }],
    });

    const plan = response.content[0].type === 'text' ? response.content[0].text : '';
    res.json({ success: true, data: { plan, date: today } });
  } catch (err) {
    next(err);
  }
}

// ─── AI TAFSIR ─────────────────────────────────────────────
export async function tafsir(req: Request, res: Response, next: NextFunction) {
  try {
    const { surahNumber, ayahNumber } = z.object({
      surahNumber: z.number().int().min(1).max(114),
      ayahNumber: z.number().int().min(1),
    }).parse(req.body);

    const cacheKey = `tafsir:${surahNumber}:${ayahNumber}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ success: true, data: { tafsir: cached } });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: ISLAMIC_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `فسّر الآية ${ayahNumber} من سورة رقم ${surahNumber} تفسيراً موجزاً مفيداً.
استند لتفسير ابن كثير والطبري والسعدي.
اذكر: معنى الآية، سبب النزول إن وُجد، الفوائد المستنبطة.
الإجابة في 3-4 فقرات فقط.`,
      }],
    });

    const tafsirText = response.content[0].type === 'text' ? response.content[0].text : '';
    await redis.setex(cacheKey, 86400, tafsirText); // Cache 24h
    res.json({ success: true, data: { tafsir: tafsirText, surahNumber, ayahNumber } });
  } catch (err) {
    next(err);
  }
}
