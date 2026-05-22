// backend/src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateTokens, verifyRefreshToken } from '../lib/jwt';
import { redis } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';
import { sendWelcomeEmail } from '../services/email';

// ─── VALIDATION SCHEMAS ────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, 'الاسم قصير جداً').max(50, 'الاسم طويل جداً'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
    .regex(/[0-9]/, 'يجب أن تحتوي على رقم'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// ─── REGISTER ──────────────────────────────────────────────
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('البريد الإلكتروني مستخدم بالفعل', 409);

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user + preferences
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        preferences: {
          create: {}, // Default preferences
        },
      },
      select: {
        id: true, name: true, email: true, role: true,
        isPremium: true, streak: true, points: true, level: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Cache user
    await redis.setex(`user:${user.id}`, 3600, JSON.stringify(user));

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name).catch(console.error);

    // Create welcome achievement
    await prisma.pointsHistory.create({
      data: { userId: user.id, amount: 50, reason: 'مرحباً بك في نور AI 🌙' },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { points: 50 },
    });

    res.status(201).json({
      success: true,
      data: { user, token: accessToken, refreshToken },
      message: `مرحباً ${user.name}! انضممت لنور AI 🌙`,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(err.errors[0].message, 400));
    }
    next(err);
  }
}

// ─── LOGIN ──────────────────────────────────────────────────
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { preferences: true },
    });
    if (!user || !user.password) throw new AppError('البريد أو كلمة المرور غير صحيحة', 401);

    // Check password
    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new AppError('البريد أو كلمة المرور غير صحيحة', 401);

    // Update streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let newStreak = user.streak;

    if (user.lastStreakDate?.toDateString() === yesterday) {
      newStreak = user.streak + 1;
    } else if (user.lastStreakDate?.toDateString() !== today) {
      newStreak = 1;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Update user + save session
    const [updatedUser] = await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: {
          streak: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak),
          lastStreakDate: new Date(),
          lastActiveAt: new Date(),
        },
        select: {
          id: true, name: true, email: true, image: true, role: true,
          isPremium: true, streak: true, points: true, level: true,
          preferences: true, createdAt: true,
        },
      }),
      prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken,
          deviceInfo: req.headers['user-agent'],
          ipAddress: req.ip,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    // Cache
    await redis.setex(`user:${user.id}`, 3600, JSON.stringify(updatedUser));

    res.json({
      success: true,
      data: { user: updatedUser, token: accessToken, refreshToken },
      message: `أهلاً ${user.name} 🌙`,
    });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors[0].message, 400));
    next(err);
  }
}

// ─── REFRESH TOKEN ─────────────────────────────────────────
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError('Refresh token مطلوب', 400);

    const userId = verifyRefreshToken(token);

    // Check session
    const session = await prisma.session.findFirst({
      where: { refreshToken: token, userId },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new AppError('الجلسة منتهية، يرجى تسجيل الدخول', 401);
    }

    const { accessToken, refreshToken: newRefresh } = generateTokens(userId);

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: accessToken,
        refreshToken: newRefresh,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({ success: true, data: { token: accessToken, refreshToken: newRefresh } });
  } catch (err) {
    next(err);
  }
}

// ─── ME ────────────────────────────────────────────────────
export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('غير مصرح', 401);

    // Try cache
    const cached = await redis.get(`user:${userId}`);
    if (cached) {
      return res.json({ success: true, data: { user: JSON.parse(cached) } });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, image: true, role: true,
        isPremium: true, streak: true, longestStreak: true, points: true,
        level: true, preferences: true, createdAt: true,
      },
    });

    if (!user) throw new AppError('المستخدم غير موجود', 404);

    await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

// ─── LOGOUT ────────────────────────────────────────────────
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ success: true });

    await Promise.all([
      prisma.session.deleteMany({ where: { token } }),
      redis.del(`user:${req.user?.id}`),
    ]);

    res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  } catch (err) {
    next(err);
  }
}
